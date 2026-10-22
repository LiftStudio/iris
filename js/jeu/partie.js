// =====================================================================
//  LA PARTIE — la base de toutes les règles (socle S0, 22/10 ; spec §§ 4.3, 4.5.5, 4.6, 4.7 ; vague 3 : L-Q, ajouts)
// =====================================================================
// En partie, js/game.js donne la main à `game.partie` : la simulation (update → pas), l'interpolation, la caméra, et une
// image d'affichage (image, après updateCamera). Une SEULE simulation, à pas fixe de 1/120 s, dans un ordre CONTRACTUEL
// (pas, § 4.3.2) : 1 mémoriser · 2 commandes (le clavier de Haythem — lireCommande, seul lecteur d'Input —, les cerveaux
// des bots) · 3 déplacements · 4 contacts · 5 portes · 6 armes (tirs RASSEMBLÉS puis appliqués : deux tirs mortels au même
// pas tuent les deux, aucun avantage à l'acteur 0) · 7 grenades · 8 règles (la sous-classe) · 9 navigation en file ·
// 10 harnais. Dans tout ce qu'appelle `pas` : ni Math.random, ni horloge du navigateur, ni Input, ni os ni caméra — le
// hasard est `this.rng`, le temps `this.t`, les entrées la commande. Les effets, les sons, le HUD réagissent aux
// ÉVÉNEMENTS (`sur`) et lisent l'état ; `etat()` / `appliquer()` sont l'hôte autoritaire de demain (§ 4.7).
import * as THREE from 'three';
import { Rng, hacher } from './rng.js';
import { PAS, TANGAGE_MAX, VERSION_ETAT, ZONES_JEU } from './constantes.js';
import { viderFronts } from './commande.js';
import { Acteur, CorpsFixe } from './acteur.js';
import { appliquerCommande, separer } from './mouvement.js';
import { lireCommande } from './entrees_jeu.js';
import { VueFPS } from './vue_fps.js';
import { CameraOrbite } from './camera_orbite.js';
import { Balistique } from './balistique.js';
import { Grenades } from './grenade.js';
import { CadenceActeurs } from './cadence_acteurs.js';
import { Nav } from './nav.js';
import { MondePartie } from './monde_partie.js';
import { ARMES, CLASSES, Arsenal, degatsDe } from './armes.js';
import { preparerAvatars, creerCorps, libererCorps, FICHE_HAYTHEM } from './avatars.js';
import { accroupir } from './accroupi.js';
import { poserArme } from './pose_arme.js';
import { Poupee } from './poupee.js';
import { CorpsProp, deplacerProp } from './corps_prop.js';
import { majProps, preparerCatalogue, retirerProp } from './deguisements.js';
import { Cerveau, CerveauBase } from './cerveau.js';
import { Errant } from './pilotage.js';
import { entree } from '../settings.js';

const ANNEAU = 256;
// les drapeaux de partie du corps de Haythem, posés à l'entrée et RETIRÉS à la sortie (l'école telle qu'en balade)
const DRAPEAUX = ['capFixe', 'sansRangs', 'audible', 'sansSouffle', 'elanAir', 'sprintMul', 'rayon', 'hautCorps', 'basCorps', 'apresPose'];
// le monde en partie : un par session (ses barrières se calculent une fois)
const _mondes = new WeakMap();
const _v = new THREE.Vector3(), _w = new THREE.Vector3();

export class Partie {
  static prerequis = { nav: true, navProps: false, avatars: true, catalogue: false };

  constructor(game, opts, deps) {
    this.game = game; this.opts = opts || {}; this.deps = deps || {};
    this.id = 'essai';
    this.graine = ((this.opts.graine ?? 1) >>> 0) || 1;
    this.rng = new Rng(this.graine);
    this.tick = 0; this.t = 0;
    this.phase = 'preparation'; this.phaseT = 0; this.phaseDuree = 0;
    this.acteurs = []; this.local = null; this.suivi = null;
    this.zone = this.opts.zone || 'ecole';
    this.monde = null; this.nav = null; this.navProps = null;
    this.balistique = new Balistique(game.collisions);
    this.grenades = new Grenades(this);
    this.cadence = new CadenceActeurs();
    this.vue = new VueFPS(game); this.orbite = new CameraOrbite(game);
    this.aff = this.deps.affichage || {};
    this.harnais = this.deps.harnais || null;
    this.hud = { vie: 100, vieMax: 100, armure: 0, arme: null, dispersion: 0, visee: 0, letales: 0, tactiques: 0, chrono: 0, phase: this.phase,
      phaseT: 0, phaseDuree: 0, manche: 1, nManches: 1, scores: null, classement: [], annonce: null, mort: null, reapparitionT: 0,
      points: [], cibles: [], prop: null, aveugle: null, astuce: null, signalesMiniCarte: [], allies: [] };
    this.degrade = false;
    this.manche = 1; this.chrono = 0; this.scores = null;
    this.imageN = 0;
    this._abonnes = new Map(); this._anneau = []; this._effets = []; this._signaux = new Map();
    this.forcees = new Map();        // (le harnais : des champs de commande forcés pendant une durée)
    this._calque = false; this._phaseVue = null; this._aveugle = null; this._pasImage = 0; this._pasMs = [];
  }
  get profil() { const a = this.local; return a && (a.role === 'prop' || a.prop) ? 'prop' : 'combat'; }

  // ---------------------------------------------------------------- préparation, entrée, sortie
  async preparer(progres) {
    const g = this.game, P = this.constructor.prerequis, pr = progres || (() => {});
    let M = _mondes.get(g);
    if (!M) { M = new MondePartie(g); M.preparerSession(); _mondes.set(g, M); }
    this.monde = M;
    pr('Plan de l’école', 0);
    if (P.nav) { this.nav = await Nav.obtenir(g, { progres: pr }); this.nav.restreindre(M.noeudsAutorises(this.nav, this.zone, this.id)); }
    if (P.navProps) { this.navProps = await Nav.obtenir(g, { rayon: 0.2, franchir: false }); this.navProps.restreindre(M.noeudsAutorises(this.navProps, this.zone, this.id)); }
    pr('Plan de l’école', 1);
    if (P.avatars) await preparerAvatars(g, this.opts.avatars || [], pr);
    if (P.catalogue) await preparerCatalogue(g, pr);
    pr('Armes et effets', 0);
    const A = this.aff;
    if (A.viewmodel?.preparer) await A.viewmodel.preparer(pr);
    A.minicarte?.preparer?.(this.nav);
    if (A.effets?.preparer) await A.effets.preparer(pr);
    A.sons?.preparer?.(); A.hud?.preparer?.(); A.hudProp?.preparer?.();
    const c = g._compilerAsync?.(g.scene);
    if (c) await c;
    pr('Armes et effets', 1);
  }
  // les acteurs de la partie (la sous-classe) — appelé par entrer, le monde déjà en état de partie
  peupler() { }
  entrer() {
    const g = this.game;
    this.monde.entrer(this.zone, this.tablePortes ? this.tablePortes() : null);
    // le corps de Haythem : ses drapeaux de balade gardés, rendus à la sortie
    this._drapeaux = {};
    for (const k of DRAPEAUX) this._drapeaux[k] = Object.prototype.hasOwnProperty.call(g.user, k) ? g.user[k] : undefined;
    this.peupler();
    this.suivi = this.local || this.acteurs[0] || null;
    if (this.local && this.local.humain && this.local.role !== 'prop' && !this.local.prop && this.local.corps === this.local.joueur) {
      this.vue.entrer(this.local);
      if (this.local.arsenal && this.aff.viewmodel) this.aff.viewmodel.montrer(this.local.arsenal.arme ? this.local.arsenal.arme.id : 'fa24');
    }
    for (const m of ['effets', 'sons', 'sonsProp', 'hud', 'hudProp', 'profil', 'killcam', 'progression']) this.aff[m]?.brancher?.(this);
    this.phaseT = 0;
  }
  sortir() {
    const g = this.game;
    for (const m of ['effets', 'sons', 'sonsProp', 'hud', 'hudProp', 'profil', 'killcam', 'progression']) { try { this.aff[m]?.debrancher?.(); } catch (e) { console.error(e); } }
    this.fermerCalque();
    for (const a of this.acteurs) this._detruire(a);
    this.acteurs = []; this.local = null; this.suivi = null;
    // le corps de Haythem rendu à la balade
    const u = g.user;
    for (const k of DRAPEAUX) { if (this._drapeaux && this._drapeaux[k] !== undefined) u[k] = this._drapeaux[k]; else delete u[k]; }
    u.speedMul = 1; u.staminaMul = 1; u.stamina = 100; u.marche = false;
    if (u.mesh) u.mesh.visible = true;
    u.vuePremiere = false;
    this.aff.viewmodel?.cacher?.();
    this.vue.sortir();
    this.monde.sortir();
    this._abonnes.clear();
  }
  _detruire(a) {
    const g = this.game;
    if (a.cerveau && a.cerveau.liberer) a.cerveau.liberer();
    if (a.prop) retirerProp(this, a);
    if (a.corps && a.corps !== a.joueur && a.corps.dispose) a.corps.dispose();
    if (a.joueur && a.joueur !== g.user) libererCorps(a.joueur);
    if (a.aff && a.aff.arme3e && a.aff.arme3e.parent) a.aff.arme3e.parent.remove(a.aff.arme3e);
  }

  // ---------------------------------------------------------------- les acteurs
  // `def` : { id, nom, equipe, role, fiche, local, humain, corps: 'joueur' | 'fixe' | 'prop', x, y, z, lacet, dotation |
  // classe, cerveau: 'minimal' | 'errant' | objet | null, difficulte, vie }
  ajouterActeur(def) {
    const g = this.game;
    const a = new Acteur(this, { id: def.id ?? this.acteurs.length, nom: def.nom || 'Acteur', equipe: def.equipe ?? null, role: def.role || 'combattant',
      fiche: def.fiche || FICHE_HAYTHEM, local: !!def.local, humain: !!def.humain });
    const x = def.x ?? 0, y = def.y ?? 0, z = def.z ?? 0, lacet = def.lacet ?? 0;
    if (def.corps === 'fixe' || a.role === 'cible') {
      a.corps = new CorpsFixe(x, y, z, Math.atan2(-Math.sin(lacet), -Math.cos(lacet)));
    } else {
      // le corps : celui de Haythem pour l'acteur local, un corps de bot sinon
      const j = a.local ? g.user : creerCorps(a.fiche, g.scene, { equipe: a.equipe });
      if (a.local) { j.capFixe = true; j.sansRangs = true; j.audible = false; j.sansSouffle = true; j.elanAir = true; j.stopEmote?.(); j.assis = null; j.rang = null; j.tel = null; }
      if (this.monde && this.monde.bornes) j.bounds = this.monde.bornes;
      j.apresPose = (p, dt) => { accroupir(p, a.accroupi); poserArme(a, dt); };
      a.joueur = j; a.corps = j;
      if (def.corps === 'prop') a.changerCorps(new CorpsProp(g.collisions, { rayon: 0.3, haut: 1, bas: 0.1, bounds: this.monde && this.monde.bornes }));
    }
    if (def.vie) { a.vie = def.vie; a.vieMax = def.vie; }
    const dot = def.dotation || (def.classe ? CLASSES[def.classe] : null);
    if (dot) a.arsenal = new Arsenal(a, dot);
    a.reapparaitre(x, y, z, lacet, this.t);
    a.protegeT = 0;
    if (def.cerveau === 'minimal') a.cerveau = new Cerveau(a, this, def.difficulte || 'regulier');
    else if (def.cerveau === 'errant') a.cerveau = new Errant(a, this);
    else if (def.cerveau && typeof def.cerveau === 'object') a.cerveau = def.cerveau;
    this.acteurs.push(a);
    if (a.local) {
      this.local = a;
      g.camYaw = lacet; g.camPitch = 0;
    }
    return a;
  }
  retirerActeur(a) {
    const i = this.acteurs.indexOf(a);
    if (i >= 0) this.acteurs.splice(i, 1);
    this._detruire(a);
    if (this.local === a) this.local = null;
    if (this.suivi === a) this.suivi = this.local || this.acteurs[0] || null;
  }
  acteurParId(id) { for (const a of this.acteurs) if (a.id === id) return a; return null; }
  get acteursVivants() { return this.acteurs.filter((a) => a.vivant && a.corps && a.role !== 'cible'); }
  // deux acteurs ennemis : pas le même, et pas de la même équipe (une équipe nulle : chacun pour soi)
  ennemis(a, b) {
    if (a === b) return false;
    if (b.role === 'cible') return true;                 // (une cible du stand : celle de tous les tireurs)
    return a.equipe === null || b.equipe === null || a.equipe !== b.equipe;
  }
  ficheArme(id) { return ARMES[id] || null; }

  // ---------------------------------------------------------------- LE PAS (§ 4.3.2 — l'ordre est un contrat ; NE PAS surcharger)
  pas(dt) {
    const g = this.game;
    // 1.
    this.tick++; this.t = this.tick * PAS;
    for (const a of this.acteurs) if (a.corps) a.corps.memoriser();
    // 2. LES COMMANDES (les fronts consommés ICI)
    for (const a of this.acteurs) {
      if (a.local) {
        viderFronts(a.cmd);
        lireCommande(g.input, g, a.cmd, this.profil, this);
        this.lireExtra(g.input, g, a.cmd);
      } else if (a.cerveau) a.cerveau.commande(dt, a.cmd);
      const F = this.forcees.get(a.id);
      if (F) {
        if (this.t <= F.fin) { Object.assign(a.cmd, F.champs); if (F.champs.lacet !== undefined && a.local) { g.camYaw = F.champs.lacet; } if (F.champs.tangage !== undefined && a.local) g.camPitch = F.champs.tangage; }
        else this.forcees.delete(a.id);
      }
    }
    // 3. LES DÉPLACEMENTS
    for (const a of this.acteurs) if (a.vivant && !a.gele && a.corps && a.role !== 'cible') this.deplacer(a, dt);
    // 4. LES CONTACTS
    separer(this.acteursVivants, g.collisions);
    // 5. LES PORTES
    this.monde.majPortes(dt, this.acteurs);
    // 6. LES ARMES : 6a les tirs (effets DIFFÉRÉS), 6b appliqués dans l'ordre
    for (const a of this.acteurs) if (a.vivant && a.arsenal) a.arsenal.pas(dt, a.cmd, this);
    this.appliquerEffets();
    // 7. LES PROJECTILES
    this.grenades.pas(dt);
    // 8. LES RÈGLES
    this.phaseT += dt;
    this.regles(dt);
    // 9. LA NAVIGATION EN FILE
    if (this.nav) this.nav.pasFile();
    // 10. LE HARNAIS (?test=1)
    this.harnais?.surveiller?.(this);
    this._pasImage++;
  }
  // étape 3 : un prop (CorpsProp) ou un humain (Player)
  deplacer(a, dt) {
    if (a.prop || a.corps instanceof CorpsProp) deplacerProp(a, a.cmd, dt, this);
    else appliquerCommande(a, a.cmd, dt, this);
  }
  regles(dt) { }
  interpoler(a) { for (const b of this.acteurs) if (b.corps) b.corps.presenter(a); }

  // ---------------------------------------------------------------- LA CAMÉRA (§ 4.3.4)
  camera(dt, poser) {
    const a = this.local;
    if (this._cachetteFixe && this._cachetteFixe()) return this.vue.poser(dt, poser);
    if (a && a.vivant && a.humain && !a.prop && a.corps === a.joueur) return this.vue.poser(dt, poser);
    if (a && a.vivant && a.prop) { this.orbite.viser(a.corps, { distance: 2.4, hauteur: 1.0, tangage: this.bornesTangage() }); return this.orbite.poser(dt, poser); }
    if (a && !a.vivant && a.corps === a.joueur && this.t - a.mortT < 3) return this.vue.poser(dt, poser);
    const s = this.suivi && this.suivi.vivant ? this.suivi : this.acteurs.find((b) => b.vivant && b.corps) || this.suivi;
    if (s && s.corps) { this.orbite.viser(s.corps, { distance: 2.6, hauteur: 1.4, tangage: [-0.7, 1.25] }); return this.orbite.poser(dt, poser); }
    return this.vue.poser(dt, poser);
  }

  // ---------------------------------------------------------------- L'IMAGE (§ 4.3.3 ; affichage, une fois par image)
  image(dt) {
    const g = this.game, cam = g.camera, A = this.aff;
    // (le chronomètre de Partie.pas : du début de l'image — fx.debutImage — à ici, divisé par les pas de l'image ; la
    // dégradation est décidée ici et appliquée au pas SUIVANT)
    const maintenant = performance.now();   // hors simulation
    if (this._pasImage > 0 && g.fx && g.fx._tDebut !== undefined) {
      this._pasMs.push((maintenant - g.fx._tDebut) / this._pasImage);
      if (this._pasMs.length > 240) this._pasMs.shift();
      if (this._pasMs.length >= 240 && !this.harnais?.figerDegrade) { const m = this._pasMs.reduce((s, v) => s + v, 0) / this._pasMs.length; this.degrade = m > 0.5; }
    }
    this._pasImage = 0;
    // (le calque « CLIQUE POUR JOUER » au passage présentation → décompte, vu ici et jamais depuis la simulation)
    if (this.phase !== this._phaseVue) {
      if (this.phase === 'decompte' && this.besoinCapture() && !this.capte()) this.attendreClic();
      this._phaseVue = this.phase;
    }
    // 1. qui est dessiné, qui est posé
    this.cadence.maj(this.acteurs, cam, this.imageN);
    // 2. les poses, sur la position AFFICHÉE
    for (const a of this.acteurs) if (a.aPoser && a.joueur && a.corps === a.joueur && dt > 0) a.joueur.poser(a.poseDt || dt, true);
    // 3. les poupées
    for (const a of this.acteurs) if (a.poupee) { a.poupee.pas(dt); a.poupee.poser(); }
    // 4. les props
    majProps(this, dt);
    // 5. le HUD et l'affichage
    this.majHud();
    const montre = !!g.input.down('scores');   // hors simulation
    A.viewmodel?.maj?.(dt, this.vue.etatArme());
    A.effets?.maj?.(dt); A.sons?.maj?.(dt, cam);
    A.hud?.maj?.(dt, this.hud); A.hudProp?.maj?.(dt, this.hud);
    A.tableau?.maj?.(this, montre); A.minicarte?.maj?.(dt, this); A.progression?.maj?.(dt);
    // 6. le monde
    this.monde.image(dt);
    this.imageN++;
  }

  // les champs communs de `hud` depuis l'acteur local (les sous-classes ajoutent les leurs)
  majHud() {
    const a = this.local, H = this.hud, A = a && a.arsenal;
    H.phase = this.phase; H.phaseT = this.phaseT; H.phaseDuree = this.phaseDuree; H.manche = this.manche; H.chrono = this.chrono;
    if (a) {
      H.vie = a.vie; H.vieMax = a.vieMax; H.armure = a.armure;
      H.arme = A && A.arme ? { id: A.arme.id, nom: A.arme.nom, chargeur: A.chargeur, reserve: A.reserve, etat: A.etatArme, k: A.visee } : null;
      H.dispersion = A ? A.dispersion : 0; H.visee = A ? A.visee : 0; H.letales = A ? A.letales : 0; H.tactiques = A ? A.tactiques : 0;
      H.reapparitionT = a.vivant ? 0 : Math.max(0, a.reapparitionT - this.t);
    }
    if (this._aveugle) this._aveugle.t = this.t - this._aveugle.t0;
    H.aveugle = this._aveugle && this._aveugle.t < this._aveugle.duree ? { t: this._aveugle.t, duree: this._aveugle.duree } : null;
    H.classement = this.acteurs.filter((b) => b.role !== 'cible').map((b) => ({ id: b.id, nom: b.nom, equipe: b.equipe, elims: b.stats.elims,
      morts: b.stats.morts, assists: b.stats.assists, score: b.stats.score, role: b.role, vivant: b.vivant }))
      .sort((x, y) => y.score - x.score || y.elims - x.elims);
    H.scores = this.scores;
    H.allies = [];
    if (a && a.equipe) {
      for (const b of this.acteurs) {
        if (b === a || b.equipe !== a.equipe || !b.vivant || !b.corps || H.allies.length >= 4) continue;
        H.allies.push({ id: b.id, nom: b.nom, x: b.corps.posAff.x, y: (b.corps.solAff ?? b.corps.pos.y) + 1.635 * b.h / 1.73 + 0.35, z: b.corps.posAff.z });
      }
    }
  }
  calme() { return !(this.phase === 'manche' || this.phase === 'traque'); }

  // ---------------------------------------------------------------- les entrées et le pointeur
  souris() {
    const s = this.game.settings, f = (s && s.controls && s.controls.fps) || {};
    const sens = f.sens ?? 0.45, a = this.local && this.local.arsenal;
    // en visée, la sensibilité suit la focale (L-B) ; le squelette : la même
    const k = 0.0025 * sens * (a && a.visee > 0 ? (f.sensVisee ?? 1) : 1);
    return [k, k * ((s && s.controls && s.controls.invertY) ? -1 : 1) * 1];
  }
  bornesTangage() { return this.local && this.local.prop ? [-0.7, 1.25] : [-TANGAGE_MAX, TANGAGE_MAX]; }
  // la capture du pointeur (VueFPS) ; sous ?test=1, la réponse simulée par le harnais
  capturer() {
    const H = this.harnais;
    if (H && H.captureSimulee) { const ok = H.captureSimulee === 'accordee'; this._capteSimule = ok; if (ok) this.fermerCalque(true); return Promise.resolve(ok); }
    return this.vue.capturer().then((ok) => { if (ok) this.fermerCalque(true); return ok; });
  }
  capte() { return document.pointerLockElement === this.game.renderer.domElement || !!this._capteSimule; }
  // la capture n'est exigée qu'au clavier-souris (la dernière entrée) ; sous ?test=1, jamais — sauf capture simulée
  besoinCapture() {
    const H = this.harnais;
    if (H && H.test && !H.captureSimulee) return false;
    const doigt = !!(entree.tactile && window.__touch && window.__touch.auDoigt);
    return !entree.manette && !doigt;
  }
  // LE CALQUE « CLIQUE POUR JOUER » (§ 4.3.5) : la partie GELÉE (game.paused, sans l'écran de pause) jusqu'au clic qui
  // capture ; la manette (A, Start) et le doigt passent outre (fermerCalque, sans capture)
  attendreClic() {
    const el = document.getElementById('calque-clic');
    if (el) el.hidden = false;
    this._calque = true; this.game.paused = true;
  }
  fermerCalque(reprendre = false) {
    const el = document.getElementById('calque-clic');
    if (el) el.hidden = true;
    if (this._calque && reprendre) { this.game.paused = false; this.game.input.purger(); }
    this._calque = false;
  }
  get calqueOuvert() { return this._calque; }
  roueOuverte() { return false; }
  mouvementSouris(dx, dy) { }
  mouvementStick(x, y) { }
  lireExtra(input, game, cmd) { }
  boutonsPause() {
    const g = this.game;
    return [
      { label: 'Reprendre', cls: 'btn-primary', onClick: () => g.togglePause(true) },
      { label: 'Tableau des scores', cls: 'btn-secondary', onClick: () => this.aff.tableau?.basculer?.(this) },
      { label: 'Options', cls: 'btn-secondary', onClick: () => g.cb.onOptions?.() },
      { label: 'Commandes', cls: 'btn-secondary', onClick: () => g.cb.onAide?.() },
      { label: 'Recommencer', cls: 'btn-secondary', onClick: () => this.deps.relancer?.() },
      { label: 'Quitter la partie', cls: 'btn-secondary', onClick: () => g.quitterPartie('menu') },
    ];
  }
  // la carte vivante suit l'acteur que suit la caméra (portes, lampes, niveau)
  get jeuCarte() {
    const s = this.suivi && this.suivi.corps ? this.suivi : this.local;
    const corps = s && s.corps ? s.corps : this.game.user;
    if (!this._jeuCarte || this._corpsCarte !== corps) { this._corpsCarte = corps; this._jeuCarte = Object.create(this.game, { user: { value: corps } }); }
    return this._jeuCarte;
  }
  peutTirer(a) {
    if (!a.vivant || a.gele || a.prop) return false;
    return !(this.phase === 'presentation' || this.phase === 'decompte' || this.phase === 'preparation' || (this.phase === 'cachette' && a.role === 'chasseur'));
  }

  // ---------------------------------------------------------------- les tirs et les dégâts
  // la résolution d'un tir : ÉMET 'impact' / 'frole', DIFFÈRE ses dégâts (jamais une vie touchée ici)
  resoudreTir(tireur, fiche, ox, oy, oz, dx, dy, dz, res, plomb) {
    if (res.acteur) {
      const d = res.t, deg = degatsDe(fiche, d, res.zone);
      this.differer({ genre: 'degats', cible: res.acteur.id, degats: deg, par: tireur.id, arme: fiche.id, zone: res.zone,
        x: res.x, y: res.y, z: res.z, dx, dy, dz, plomb });
    } else if (res.mat !== 'rien') {
      this.evt('impact', { x: res.x, y: res.y, z: res.z, nx: res.nx, ny: res.ny, nz: res.nz, mat: res.mat, forme: res.forme ? res.forme.id ?? null : null, plomb });
    }
    // la balle qui frôle une tête (< 1,5 m) sans la toucher
    const tMax = res.t;
    for (const b of this.acteurs) {
      if (b === tireur || b === res.acteur || !b.vivant || !b.corps || b.role === 'cible') continue;
      b.oeil(_v);
      const px = _v.x - ox, py = _v.y - oy, pz = _v.z - oz, t = px * dx + py * dy + pz * dz;
      if (t <= 0 || t >= tMax) continue;
      const qx = ox + dx * t - _v.x, qy = oy + dy * t - _v.y, qz = oz + dz * t - _v.z;
      if (qx * qx + qy * qy + qz * qz < 2.25) this.evt('frole', { a: b.id, x: ox + dx * t, y: oy + dy * t, z: oz + dz * t });
    }
  }
  differer(effet) { this._effets.push(effet); }
  appliquerEffets() {
    if (!this._effets.length) return;
    const L = this._effets; this._effets = [];
    for (const e of L) this.appliquerEffet(e);
  }
  appliquerEffet(e) {
    if (e.genre === 'degats') {
      const c = this.acteurParId(e.cible);
      if (c) this.infliger(c, e.degats, e);
    }
  }
  // LA SEULE PORTE DES DÉGÂTS : protection d'apparition, tir allié, armure, 'touche', 'elim', aides
  infliger(cible, degats, o) {
    const { par = -1, arme = null, zone = 'torse', x = 0, y = 0, z = 0, dx = 0, dy = 0, dz = 0, plomb = 0 } = o || {};
    if (!cible.vivant || degats <= 0) return 0;
    const tireur = this.acteurParId(par);
    if (tireur && tireur !== cible && !this.ennemis(tireur, cible)) return 0;          // tir allié : désactivé
    if (cible.protegeT > this.t) return 0;
    if (tireur && tireur.protegeT > this.t) tireur.protegeT = this.t;                    // (la protection finit au premier tir)
    let d = degats;
    if (cible.armure > 0) { const a = Math.min(cible.armure, d * 0.5); cible.armure -= a; d -= a; }
    d = Math.min(d, cible.vie);
    cible.vie -= d; cible.derniereTouche = { t: this.t, par, arme };
    (cible._aides || (cible._aides = [])).push({ par, d, t: this.t });
    if (tireur) { tireur.stats.touches++; tireur.stats.degats += d; }
    const tete = zone === 'tete';
    this.evt('touche', { par, cible: cible.id, zone, degats: d, x, y, z, tete, dx, dz });
    if (cible.vie <= 1e-9) {
      cible.vie = 0;
      const assists = [];
      for (const h of cible._aides) if (h.par !== par && h.par >= 0 && this.t - h.t <= 5 && !assists.includes(h.par)) {
        const tot = cible._aides.filter((k) => k.par === h.par && this.t - k.t <= 5).reduce((s, k) => s + k.d, 0);
        if (tot >= 30) assists.push(h.par);
      }
      cible._aides = [];
      cible.mourir(this.t); cible.stats.morts++;
      if (tireur && tireur !== cible) { tireur.stats.elims++; if (tete) tireur.stats.tetes++; }
      for (const id of assists) { const b = this.acteurParId(id); if (b) b.stats.assists++; }
      this.evt('elim', { par, cible: cible.id, arme, tete, x: cible.pos.x, y: cible.pos.y, z: cible.pos.z, ix: dx, iy: dy, iz: dz, assists });
      if (cible.joueur && cible.corps === cible.joueur && !cible.local) cible.poupee = new Poupee(cible.joueur, null, null, this.game.collisions);
      if (cible.local) this.vue.mort(par);
    }
    return d;
  }
  soigner(cible, pv, cause) {
    if (!cible.vivant) return 0;
    const avant = cible.vie; cible.vie = Math.min(cible.vieMax, cible.vie + pv);
    if (cible.vie > avant) this.evt('soin', { a: cible.id, pv: cible.vie - avant, cause: cause || null });
    return cible.vie - avant;
  }
  // la mémoire d'équipe des bots : ce qu'un bot repère est partagé (0,6 s plus tard, oublié après 6 s : L-J)
  signaler(equipe, idCible, x, y, z) {
    if (!this._signaux.has(equipe)) this._signaux.set(equipe, []);
    const L = this._signaux.get(equipe);
    L.push({ id: idCible, x, y, z, t: this.t });
    while (L.length && this.t - L[0].t > 6) L.shift();
  }
  signalements(equipe) { const L = this._signaux.get(equipe) || []; return L.filter((s) => this.t - s.t <= 6); }

  // ---------------------------------------------------------------- phases, annonces, événements
  phaseVers(phase, duree) { this.phase = phase; this.phaseT = 0; this.phaseDuree = duree || 0; this.evt('phase', { phase, duree: duree || 0 }); }
  annonce(texte, cls) { this.hud.annonce = { texte, cls: cls || 'info', t: this.t }; this.evt('annonce', { texte, cls: cls || 'info' }); }
  evt(type, data) {
    const e = { t: this.t, type, ...data };
    this._anneau.push(e); if (this._anneau.length > ANNEAU) this._anneau.shift();
    if (type === 'flash' && this.local && e.cible === this.local.id) this._aveugle = { t0: this.t, t: 0, duree: e.duree };
    const L = this._abonnes.get(type), T = this._abonnes.get('*');
    if (L) for (const f of [...L]) f(e);
    if (T) for (const f of [...T]) f(e);
    return e;
  }
  sur(type, fn) {
    if (!this._abonnes.has(type)) this._abonnes.set(type, new Set());
    this._abonnes.get(type).add(fn);
    return () => { const L = this._abonnes.get(type); if (L) L.delete(fn); };
  }
  get evenements() { return this._anneau; }

  // ---------------------------------------------------------------- L'ÉTAT (§ 4.7)
  etat() {
    return { v: VERSION_ETAT, mode: this.id, zone: this.zone, graine: this.graine, tick: this.tick, t: this.t, rng: this.rng.etat,
      phase: this.phase, phaseT: this.phaseT, phaseDuree: this.phaseDuree, manche: this.manche, chrono: this.chrono,
      scores: this.scores ? { ...this.scores } : null,
      acteurs: this.acteurs.map((a) => a.etat()), grenades: this.grenades.etat(), portes: this.monde ? this.monde.etat() : [],
      points: (this.hud.points || []).map((p) => ({ ...p })), evenements: this._anneau.map((e) => ({ ...e })) };
  }
  appliquer(e) {
    this.tick = e.tick; this.t = e.t; this.rng.etat = e.rng;
    this.phase = e.phase; this.phaseT = e.phaseT; this.phaseDuree = e.phaseDuree; this.manche = e.manche; this.chrono = e.chrono;
    this.scores = e.scores ? { ...e.scores } : null;
    for (const s of e.acteurs) { const a = this.acteurParId(s.id); if (a) a.appliquer(s); }
    this.grenades.appliquer(e.grenades);
    if (this.monde) this.monde.appliquer(e.portes);
    this.hud.points = (e.points || []).map((p) => ({ ...p }));
    this._anneau = (e.evenements || []).map((x) => ({ ...x }));
  }
  empreinte() { return hacher(this.etat(), 1e-6); }
}
