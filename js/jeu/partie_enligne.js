// =====================================================================
//  LES PARTIES EN LIGNE (27/10/2026, « un serveur pour jouer en multijoueur, comme mon jeu de basket »)
// =====================================================================
// Deux modes entre vrais élèves, chacun sur son PC, son téléphone, sa tablette, chacun dans SON salon du serveur
// (serveur/relais.js, dix au plus) : le MATCH À MORT PAR ÉQUIPES (SISR contre SLAM ; salon PUBLIC, ?partie=enligne) et,
// depuis le 27/10 au soir, le PROP HUNT (salon PROPHUNT, ?partie=propenligne). L'écran EN LIGNE du menu choisit.
//
// QUI DÉCIDE QUOI — le principe des jeux de tir en ligne simples (et de LA CAGE) :
//   - CHACUN SIMULE SON SOLDAT (ou son meuble), et lui seul : sa course, ses sauts, son arme, son déguisement. Il en envoie
//     l'état vingt fois par seconde (`pos`). Les autres le voient comme un acteur `distant` — un corps SANS cerveau, posé à
//     chaque pas à l'état reçu, montré 110 ms en arrière et interpolé entre les deux états qui encadrent l'heure montrée.
//   - LE TIREUR VOIT SA BALLE TOUCHER, LA VICTIME COMPTE LES DÉGÂTS. Une balle de Haythem sur un acteur distant part en
//     `touche` vers le PC de la victime, qui l'applique à SON soldat (gilet, protection d'apparition, tir allié : ses règles).
//     Le marqueur de touche s'allume tout de suite chez le tireur.
//   - LA VICTIME ANNONCE SA MORT (`elim`, à tous) : chacun la rejoue chez lui (le fil, le score, les médailles du tueur).
//   - Les TIRS (et les provocations d'un prop) se voient et s'entendent chez les autres : groupés par pas (`fx`).
//   - Équipes : le plus ancien donne le score et le temps au nouveau venu (`sync`). Prop hunt : le plus ancien MÈNE LES
//     MANCHES — il distribue les rôles (`manche`) et dit les phases (`phase` : cachette, traque, révélation, fin) ; les autres
//     suivent. S'il part, le suivant reprend là où sa partie en est.
// Pas de bots : rien que des élèves. Pas de pause non plus : la pause ouvre son écran, mais la partie continue (les autres,
// eux, jouent) — Haythem ne bouge plus et ne tire plus tant qu'elle est ouverte.
// Pas encore : les grenades des autres ne se voient pas voler (leurs dégâts, eux, arrivent bien), ni leurs séries.
import { PartieFPS } from './partie_fps.js';
import { PartieProp, REGLAGES_PROP } from './partie_prop.js';
import { FICHES_BOTS, FICHE_HAYTHEM } from './avatars.js';
import { ARMES, DOTATION_CHASSEUR } from './armes.js';
import { ficheEquipee } from './series.js';
import { CHAMPS_COMMANDE } from './commande.js';
import { EQUIPES } from './constantes.js';
import { departs } from './apparitions.js';
import { deguiser, retirerProp } from './deguisements.js';
import { Reseau, profilEnLigne } from './reseau.js';

const RETARD = 0.11;                 // s : l'état d'un autre est montré avec ce retard (deux paquets d'avance à 20 Hz)
const ENVOI = 1 / 20;                // s : un `pos` toutes les 50 ms
const FX = new Set(['tir', 'trajet', 'impact', 'provocation']);
const TOUS = [FICHE_HAYTHEM.id, ...FICHES_BOTS.map((f) => f.id)];
const r3 = (v) => Math.round(v * 1000) / 1000;
const ang = (a, b, k) => { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return a + d * k; };

// LA COUCHE RÉSEAU, commune aux modes en ligne : posée sur une Partie (PartieFPS, PartieProp) — la connexion, les acteurs
// distants et leur état interpolé, les tirs, les touches, les morts. Chaque mode y ajoute ce qui lui est propre par quelques
// crochets : `_salon` (le salon du serveur), `_defArrivee` / `_apresArrivee` (le corps d'un nouveau venu), `_poserExtra` /
// `_etatExtra` (ce que son état porte en plus), `_recevoirAutre` (ses messages à lui).
const avecReseau = (Base) => class extends Base {
  _initReseau() {
    const P = profilEnLigne();
    this.pseudo = String(this.opts.pseudo || P.pseudo).slice(0, 16);
    this.avatar = TOUS.includes(this.opts.avatar) ? this.opts.avatar : TOUS.includes(P.avatar) ? P.avatar : 'haythem';
    this.reseau = null; this._dist = new Map(); this._idDist = 100; this._dernierEnvoi = -1; this._fx = []; this._rejoue = false;
    this._tirTick = -1; this._synchro = false; this.vus = new Map(); this.enLigne = true;
  }
  get _salon() { return 'PUBLIC'; }
  // ---------------------------------------------------------------- se connecter avant d'entrer dans l'école
  async _connecter(progres) {
    const pr = progres || (() => {});
    pr('Connexion au serveur', 0);
    this.reseau = new Reseau({ nom: this.pseudo, perso: { av: this.avatar }, salon: this._salon });
    const ok = await this.reseau.connecter(5000);
    if (!ok) { this.reseau.fermer(); throw new Error('[jeu] serveur en ligne injoignable — lance le jeu avec Lancer.bat (Node.js) ou donne ?serveur='); }
    pr('Connexion au serveur', 1);
  }
  titrePause() { return `${super.titrePause()} · EN LIGNE · ${this.reseau ? this.reseau.presents.length : 1} ÉLÈVE(S) · LA PARTIE CONTINUE`; }
  sortir() { try { this.reseau?.fermer(); } catch (e) { /* ignore */ } return super.sortir(); }

  // ---------------------------------------------------------------- le pas : lire le réseau, simuler, envoyer
  pas(dt) {
    if (this.reseau) this._lireReseau();
    super.pas(dt);
    if (this.reseau) this._envoyer();
  }
  // (la pause ne fige pas une partie en ligne : Haythem lâche tout tant qu'elle est ouverte — js/game.js fait avancer les pas)
  lireExtra(input, game, cmd) {
    super.lireExtra(input, game, cmd);
    if (!game.paused) return;
    for (const k of CHAMPS_COMMANDE) if (k !== 'lacet' && k !== 'tangage' && k !== 'seq') cmd[k] = typeof cmd[k] === 'number' ? (k === 'provoc' ? -1 : 0) : false;
  }
  deplacer(a, dt) { if (a.distant) return this._poser(a); return super.deplacer(a, dt); }

  // ---------------------------------------------------------------- les messages reçus
  _lireReseau() {
    const R = this.reseau;
    for (const m of R.lire()) {
      if (m.from === R.id) continue;
      switch (m.t) {
        case 'pos': this._recevoirPos(m); break;
        case 'fx': this._recevoirFx(m); break;
        case 'touche': if (m.vers === R.id) this._recevoirTouche(m); break;
        case 'elim': this._recevoirElim(m); break;
        case 'leave': this._partir(m.id); break;
        default: this._recevoirAutre(m); break;
      }
    }
    // (un élève dont on n'a plus de nouvelles depuis 6 s — onglet fermé sans `leave`, coupure — : retiré)
    const maintenant = performance.now() / 1000;
    for (const [id, a] of this._dist) if (maintenant - a._vuA > 6) this._partir(id);
    for (const a of this._dist.values()) this._vivantOuNon(a, maintenant);
  }
  _recevoirAutre(m) { }
  // SA VIE, d'après ses états (montrés avec le retard) : revenu en jeu — l'apparition, sa poupée effacée, son corps posé
  // d'un coup là où il réapparaît — ; mort sans que son `elim` soit arrivé (un paquet perdu) — couché d'office, sans poupée
  _vivantOuNon(a, maintenant) {
    const B = a._tampon; if (!B.length) return;
    const tm = maintenant - RETARD;
    let s = B[0]; for (const b of B) if (b.tr <= tm) s = b;
    const v = !!s.s.v;
    // (revenu en jeu : seulement d'après un état REÇU APRÈS sa mort — les états d'avant, montrés en retard, le disent encore
    // vivant, et l'auraient relevé aussitôt tombé)
    if (v && !a.vivant && s.tr > (a._mortTr || 0) + 0.05) {
      const p = s.s, c = a.corps;
      a.vivant = true; a.vie = p.vie || a.vieMax; a.reapparitionT = 0; a.derniereTouche = null; a._mortSans = null;
      c.pos.set(p.x, p.y, p.z); if (c.posPrec) c.posPrec.copy(c.pos); if (c.posAff) c.posAff.copy(c.pos); c.solAff = p.y;
      this.evt('apparition', { a: a.id, x: p.x, y: p.y, z: p.z });
    } else if (!v && a.vivant) {
      if (a._mortSans === null || a._mortSans === undefined) a._mortSans = maintenant;
      else if (maintenant - a._mortSans > 0.6) { a.mourir(this.t); a._mortSans = null; a._mortTr = maintenant; if (a.joueur && a.joueur.mesh) a.joueur.mesh.visible = false; }
    } else a._mortSans = null;
  }
  _recevoirPos(m) {
    const s = m.s; if (!s || typeof s !== 'object') return;
    // (un paquet mal formé ne casse rien : chaque nombre lu est vérifié — une position NaN empoisonnerait la scène et les sons)
    for (const k of ['x', 'y', 'z', 'vx', 'vz', 'c', 'l', 'tg', 'jy', 'ac', 'gl', 'ax', 'ay', 'vie', 'ar', 'pc']) if (s[k] !== undefined && s[k] !== null && !Number.isFinite(s[k])) return;
    if (!Number.isFinite(s.x) || !Number.isFinite(s.y) || !Number.isFinite(s.z)) return;
    this.vus.set(m.from, s.eq);
    let a = this._dist.get(m.from);
    if (!a) a = this._arrivee(m.from, s);
    if (!a) return;
    const tr = performance.now() / 1000;
    a._vuA = tr;
    const B = a._tampon;
    B.push({ tr, s });
    while (B.length > 30) B.shift();
    a.nom = String(s.nom || a.nom).slice(0, 16);
  }
  // un élève qui arrive : son acteur, un corps de bot à son visage ; personne ne le commande ici
  _arrivee(id, s) {
    if (this._dist.size >= 12) return null;
    const base = FICHES_BOTS.find((f) => f.id === s.av) || FICHE_HAYTHEM;
    const a = this.ajouterActeur({ id: this._idDist++, nom: String(s.nom || 'Élève').slice(0, 16), fiche: { ...base, nom: s.nom || base.nom },
      x: s.x, y: s.y, z: s.z, lacet: s.l || 0, ...this._defArrivee(s) });
    a.distant = true; a.netId = id; a.cerveau = null; a._tampon = []; a._vuA = performance.now() / 1000;
    a.gele = false; if (a.arsenal) a.arsenal.bloque = true;
    this._dist.set(id, a);
    this._apresArrivee(a, s);
    if (!s.v) { a.mourir(this.t); if (a.joueur && a.joueur.mesh) a.joueur.mesh.visible = false; }
    return a;
  }
  _defArrivee(s) { return {}; }
  _apresArrivee(a, s) { }
  _poserExtra(a, q) { }
  _etatExtra(s) { }
  _partir(id) {
    const a = this._dist.get(id); if (!a) return;
    this._dist.delete(id);
    if (a.poupee) { a.poupee.liberer?.(); a.poupee = null; }
    if (a.prop) retirerProp(this, a);
    this.retirerActeur(a);
    this.annonce(`${String(a.nom).toUpperCase()} A QUITTÉ L’ÉCOLE`, 'info');
  }
  // L'ÉTAT MONTRÉ d'un acteur distant (étape 3 du pas) : les deux états qui encadrent « maintenant − RETARD », interpolés
  _poser(a) {
    const B = a._tampon; if (!B || !B.length) return;
    const tm = performance.now() / 1000 - RETARD;
    let i = B.length - 1;
    while (i > 0 && B[i - 1].tr > tm) i--;
    const s1 = B[i], s0 = i > 0 ? B[i - 1] : s1;
    const k = s1 === s0 ? 1 : Math.max(0, Math.min(1, (tm - s0.tr) / Math.max(1e-3, s1.tr - s0.tr)));
    const p = s0.s, q = s1.s;
    this._poserExtra(a, q);               // (avant la position : un changement de rôle ou de forme change de corps)
    const c = a.corps;
    const x = p.x + (q.x - p.x) * k, y = p.y + (q.y - p.y) * k, z = p.z + (q.z - p.z) * k;
    // (un saut de plus de 3 m : une réapparition, posée d'un coup — sinon on le verrait glisser à travers les murs)
    if (Math.hypot(x - c.pos.x, z - c.pos.z) > 3) { c.pos.set(x, y, z); if (c.posPrec) c.posPrec.copy(c.pos); if (c.posAff) c.posAff.copy(c.pos); c.solAff = y; }
    else c.pos.set(x, y, z);
    c.vel.set(q.vx || 0, 0, q.vz || 0);
    const cap = ang(p.c || 0, q.c || 0, k);
    c.ang = cap; if (c.setFacing) c.setFacing(Math.sin(cap), Math.cos(cap));
    c.jumpY = q.jy || 0; c.airborne = !!q.air;
    a.cmd.lacet = ang(p.l || 0, q.l || 0, k); a.cmd.tangage = (p.tg || 0) + ((q.tg || 0) - (p.tg || 0)) * k;
    a.accroupi = q.ac || 0; a.glisse = q.gl || 0;
    a.cmd.visee = !!q.vi; a.cmd.sprint = !!q.sp; a.cmd.ax = q.ax || 0; a.cmd.ay = q.ay || 0;
    a.vie = q.vie ?? a.vie; a.armure = q.ar || 0; a.protegeT = q.pr ? this.t + 0.2 : 0;
    if (q.st) { a.stats.elims = q.st[0]; a.stats.morts = q.st[1]; if (Number.isFinite(q.st[2])) a.stats.score = q.st[2]; }
    this._poserArme(a, q.w);
  }
  // l'arme qu'il tient (son geste : visée, recharge, changement — les temps ramenés à NOTRE horloge), changée s'il en a changé
  _poserArme(a, w) {
    const A = a.arsenal; if (!A || !w) return;
    const ids = (w.ids || []).filter((x) => ARMES[x]);
    const cur = A.armes.map((f) => (f && (f.base || f.id)) + ':' + ((f && f.viseur) || ''));
    const voulu = ids.map((x, j) => x + ':' + (j === w.i && w.vis ? w.vis : ''));
    if (ids.length && cur.join() !== voulu.join()) {
      A.armes = ids.map((x, j) => ficheEquipee(ARMES[x], null, null, j === w.i ? w.vis || null : null));
      A.ch = ids.map((x, j) => A.ch[j] ?? ARMES[x].chargeur ?? 0); A.res = ids.map((x, j) => A.res[j] ?? ARMES[x].reserve ?? 0); A.pr = ids.map(() => 0);
    }
    if (w.i >= 0 && w.i < A.armes.length) A.i = w.i;
    if (typeof w.et === 'string') { if (A.et !== w.et) A.t0 = this.t - (w.te || 0); A.et = w.et; }
    A.vk = w.vk || 0;
    if (Number.isFinite(w.ch)) A.ch[A.i] = w.ch;
    if (Number.isFinite(w.re)) A.res[A.i] = w.re;
  }
  // ses tirs, ses provocations : rejoués ici au nom de son acteur (la lueur, le trajet, le bruit, l'impact sur le mur)
  _recevoirFx(m) {
    const a = this._dist.get(m.from); if (!a || !Array.isArray(m.L)) return;
    this._rejoue = true;
    try {
      for (const [type, d] of m.L) {
        if (!FX.has(type) || !d) continue;
        if (type === 'impact') super.evt('impact', d);
        else if (type === 'provocation') super.evt(type, { ...d, a: a.id, points: 0 });
        else super.evt(type, { ...d, a: a.id });
      }
    } finally { this._rejoue = false; }
  }
  // une balle d'un autre qui touche Haythem : appliquée à son soldat, comme une balle de bot (6b du pas : l'effet différé)
  _recevoirTouche(m) {
    const a = this._dist.get(m.from), L = this.local;
    if (!a || !L || !L.vivant || !(m.d > 0)) return;
    this.differer({ genre: 'degats', cible: L.id, degats: Math.min(300, +m.d), par: a.id, arme: ARMES[m.arme] ? m.arme : null, zone: m.zone || 'torse',
      x: +m.x || 0, y: +m.y || 0, z: +m.z || 0, dx: +m.dx || 0, dy: +m.dy || 0, dz: +m.dz || 0, plomb: m.plomb, seq: m.seq });
  }
  // la mort d'un autre, annoncée par lui : rejouée ici (son corps tombe, le fil, le score, la médaille du tueur)
  _recevoirElim(m) {
    const cible = this._dist.get(m.from); if (!cible || !cible.vivant) return;
    const R = this.reseau, tireur = m.par === R.id ? this.local : m.par === m.from ? cible : this._dist.get(m.par) || null;
    cible.vie = 0; cible._aides = []; cible._mortTr = performance.now() / 1000;
    cible.mourir(this.t); cible.stats.morts++;
    if (tireur && tireur !== cible) { tireur.stats.elims++; if (m.tete) tireur.stats.tetes++; }
    const n = (v) => (Number.isFinite(+v) ? +v : 0);
    this.evt('elim', { par: tireur ? tireur.id : -1, cible: cible.id, arme: m.arme === 'meuble' ? 'meuble' : ARMES[m.arme] ? m.arme : null, tete: !!m.tete,
      x: cible.pos.x, y: cible.pos.y, z: cible.pos.z, ix: n(m.ix), iy: n(m.iy), iz: n(m.iz), assists: [], px: n(m.px) || cible.pos.x, py: n(m.py) || cible.pos.y + 1, pz: n(m.pz) || cible.pos.z });
  }

  // ---------------------------------------------------------------- ce que Haythem envoie
  _envoyer() {
    const R = this.reseau, L = this.local;
    if (this._fx.length) { R.envoyer({ t: 'fx', L: this._fx.splice(0, 60) }); this._fx.length = 0; }
    // (au temps RÉEL, pas à celui de la partie : un PC qui rame simule moins vite, et ne doit pas pour autant se taire — au
    // bout de 6 s de silence, les autres le croient parti)
    const maintenant = performance.now() / 1000;
    if (!L || maintenant - this._dernierEnvoi < ENVOI - 1e-3) return;
    this._dernierEnvoi = maintenant;
    const c = L.corps, A = L.arsenal, f = A && A.arme;
    const s = {
      nom: this.pseudo, av: this.avatar, eq: L.equipe, v: !!L.vivant,
      x: r3(c.pos.x), y: r3(c.pos.y), z: r3(c.pos.z), vx: r3(c.vel.x), vz: r3(c.vel.z), c: r3(c.ang || 0), l: r3(L.cmd.lacet), tg: r3(L.cmd.tangage),
      jy: r3(c.jumpY || 0), air: !!c.airborne, ac: r3(L.accroupi), gl: r3(L.glisse), vi: !!L.cmd.visee, sp: !!L.cmd.sprint, ax: r3(L.cmd.ax || 0), ay: r3(L.cmd.ay || 0),
      vie: Math.round(L.vie), ar: Math.round(L.armure || 0), pr: L.protegeT > this.t, st: [L.stats.elims, L.stats.morts, L.stats.score],
      w: A ? { ids: A.armes.map((x) => x && (x.base || x.id)), i: A.i, vis: (f && f.viseur) || null, et: A.et, te: r3(Math.max(0, this.t - A.t0)), vk: r3(A.vk || 0),
        ch: A.chargeur, re: A.reserve } : null };
    this._etatExtra(s);
    R.envoyer({ t: 'pos', s });
  }
  // LES ÉVÉNEMENTS de Haythem qui partent : ses tirs (et les impacts de ses balles), ses provocations, sa mort
  evt(type, data) {
    const e = super.evt(type, data), L = this.local, R = this.reseau;
    if (!R || this._rejoue || !L) return e;
    if ((type === 'tir' || type === 'trajet' || type === 'provocation') && data && data.a === L.id) {
      if (type === 'tir') this._tirTick = this.tick;
      const d = { ...data }; delete d.a; this._fx.push([type, d]);
    } else if (type === 'impact' && this._tirTick === this.tick) this._fx.push(['impact', { ...data }]);
    else if (type === 'elim' && data && data.cible === L.id) {
      const t = data.par >= 0 ? this.acteurParId(data.par) : null;
      R.envoyer({ t: 'elim', par: t ? (t === L ? R.id : t.netId || null) : null, arme: data.arme || null, tete: !!data.tete,
        ix: r3(data.ix || 0), iy: r3(data.iy || 0), iz: r3(data.iz || 0), px: r3(data.px || 0), py: r3(data.py || 0), pz: r3(data.pz || 0) });
    }
    return e;
  }
  // UNE BALLE (une grenade, un couteau) DE HAYTHEM SUR UN DISTANT : envoyée à la victime ; ici, le marqueur et la précision
  infliger(cible, degats, o) {
    if (!cible || !cible.distant) return super.infliger(cible, degats, o);
    const O = o || {}, tireur = this.acteurParId(O.par ?? -1);
    if (!tireur || !tireur.local || !cible.vivant || !(degats > 0) || !this.ennemis(tireur, cible)) return 0;
    if (tireur.protegeT > this.t) tireur.protegeT = this.t;
    this.reseau.envoyer({ t: 'touche', vers: cible.netId, d: r3(degats), arme: O.arme || null, zone: O.zone || 'torse', x: r3(O.x || 0), y: r3(O.y || 0), z: r3(O.z || 0),
      dx: r3(O.dx || 0), dy: r3(O.dy || 0), dz: r3(O.dz || 0), plomb: O.plomb, seq: O.seq });
    const f = O.arme ? ARMES[O.arme] : null, multi = O.plomb !== undefined && f && f.plombs > 1;
    if (f && f.rpm && (!multi || tireur._seqTouche !== O.seq)) tireur.stats.touches++;
    if (multi) tireur._seqTouche = O.seq;
    const d = Math.min(degats, cible.vie);
    tireur.stats.degats += d;
    this.evt('touche', { par: tireur.id, cible: cible.id, zone: O.zone || 'torse', degats: d, x: O.x || 0, y: O.y || 0, z: O.z || 0, tete: O.zone === 'tete',
      dx: O.dx || 0, dz: O.dz || 0, arme: O.arme ?? null });
    return d;
  }
};

// ===================================================================== LE MATCH À MORT PAR ÉQUIPES EN LIGNE
export class PartieEnLigne extends avecReseau(PartieFPS) {
  constructor(game, opts, deps) {
    super(game, { presentation: 3, decompte: 3, scoreCible: 50, duree: 15 * 60, ...opts, mode: 'equipes', allies: 0, ennemis: 1,
      avatars: FICHES_BOTS.map((f) => f.id) }, deps);
    this.id = 'enligne'; this.nomMode = 'En ligne · match à mort par équipes';
    this.effectifs = { ...this.effectifs, allies: 0, ennemis: 0, bots: 0 };
    this._initReseau();
  }
  async preparer(progres) {
    await this._connecter(progres);
    await super.preparer(progres);
    // L'ÉQUIPE : la moins nombreuse. Celle de chaque présent, d'après ce qu'il a annoncé (sa carte du salon) ou envoyé (`pos`) ;
    // un présent qui n'a encore rien dit — arrivé en même temps, encore en préparation — compté comme s'il avait suivi la même
    // règle, dans l'ordre d'arrivée : deux élèves qui lancent ensemble tombent l'un SISR, l'autre SLAM
    const R = this.reseau;
    for (const m of R.recus) if (m.t === 'pos' && m.s && (m.s.eq === 'A' || m.s.eq === 'B')) this.vus.set(m.from, m.s.eq);
    for (const [id, c] of R.cartes) if (c && (c.eq === 'A' || c.eq === 'B') && !this.vus.has(id)) this.vus.set(id, c.eq);
    const n = { A: 0, B: 0 };
    let moi = 'A';
    for (const id of R.presents) {
      const eq = id === R.id ? null : this.vus.get(id);
      const choix = eq || (n.B < n.A ? 'B' : 'A');
      if (id === R.id) { moi = choix; continue; }
      n[choix]++;
    }
    if (!R.presents.includes(R.id)) moi = n.B < n.A ? 'B' : 'A';
    this.camp = moi;
    R.annoncer({ av: this.avatar, eq: this.camp });
  }
  peupler() {
    super.peupler();
    if (this.local) { this.local.nom = this.pseudo; this.local.netId = this.reseau.id; }
    this.annonce(`EN LIGNE · ${EQUIPES[this.camp].nom} · ${this.reseau.presents.length} ÉLÈVE${this.reseau.presents.length > 1 ? 'S' : ''} DANS L’ÉCOLE`, 'presentation');
  }
  _bandeau() { return `EN LIGNE · ${EQUIPES.A.nom} CONTRE ${EQUIPES.B.nom} · ${this.scoreCible} TOUCHÉS`; }
  titrePause() { return `EN LIGNE · ${this.reseau ? this.reseau.presents.length : 1} ÉLÈVE(S) · LA PARTIE CONTINUE`; }
  // un acteur distant n'est ni gelé par la présentation ni ressuscité ici : c'est son PC qui décide
  _geler(v) { for (const a of this.acteurs) { if (a.distant) continue; a.gele = v; if (a.arsenal) a.arsenal.bloque = v; } }
  _reapparaitre(a) { if (a.distant) return false; return super._reapparaitre(a); }
  _defArrivee(s) {
    const ids = (s.w && Array.isArray(s.w.ids) ? s.w.ids : ['fa24', 'p17']).filter((x) => ARMES[x]);
    return { equipe: s.eq === 'B' ? 'B' : 'A', dotation: { principale: ids.find((x) => ARMES[x].emplacement === 'principale') || 'fa24',
      secondaire: ids.find((x) => ARMES[x].emplacement === 'secondaire') || 'p17', letale: null, tactique: null, couteau: true } };
  }
  _apresArrivee(a) {
    this._ext(a); a._fiches = a.arsenal ? a.arsenal.armes.slice() : null;
    this.annonce(`${a.nom.toUpperCase()} REJOINT LES ${(EQUIPES[a.equipe] || {}).nom || ''}`, 'info');
  }
  _poserExtra(a, q) { if (q.eq !== a.equipe && (q.eq === 'A' || q.eq === 'B')) a.equipe = q.eq; }
  _recevoirAutre(m) {
    const R = this.reseau;
    if (m.t === 'sync') { if (m.vers === R.id && !this._synchro) this._recevoirSync(m); }
    else if (m.t === 'join') { if (m.id !== R.id && R.suisAncien) this._donnerScore(m.id); }
  }
  _donnerScore(vers) {
    this.reseau.envoyer({ t: 'sync', vers, scores: this.scores ? { A: this.scores.A, B: this.scores.B } : null, tJeu: this.tJeu });
  }
  _recevoirSync(m) {
    this._synchro = true;
    if (m.scores && this.scores) { this.scores.A = Math.max(0, m.scores.A | 0); this.scores.B = Math.max(0, m.scores.B | 0); }
    if (Number.isFinite(m.tJeu) && m.tJeu > 0) { this.tJeu = Math.min(this.duree - 30, m.tJeu); this.chrono = Math.max(0, this.duree - this.tJeu); }
  }
}

// ===================================================================== LE PROP HUNT EN LIGNE
// Les mêmes manches que le prop hunt contre les bots (js/jeu/partie_prop.js : présentation, cachette, traque, révélation),
// entre élèves. Le PLUS ANCIEN du salon les mène : à chaque manche il tire les rôles — un tiers de chasseurs (un au moins),
// à tour de rôle d'une manche à l'autre — et les envoie (`manche`) ; il dit chaque changement de phase (`phase`), la fin de
// la traque comprise (tous les props trouvés, tous les chasseurs tombés, le temps). Les autres appliquent. Seul, on attend
// un deuxième élève (phase `attente` : on se promène, rien ne compte). Un élève qui arrive en pleine traque regarde la
// manche en spectateur et joue la suivante. Chacun garde son score (il voyage dans son état) ; le classement final les lit.
export class PartiePropEnLigne extends avecReseau(PartieProp) {
  constructor(game, opts, deps) {
    super(game, { manches: 6, ...opts, avatars: FICHES_BOTS.map((f) => f.id), acteurs: 4, chasseurSeul: false, premierRole: 'prop' }, deps);
    // (la zone : celle que tout le monde calcule pareil au lancement — jamais le dernier choix du menu de ce PC)
    this.zone = null; this.nManches = 6;
    this.idLancement = 'propenligne';
    this._roles = new Map(); this._manchesRecues = 0;
    this._initReseau();
  }
  get _salon() { return 'PROPHUNT'; }
  async preparer(progres) {
    await this._connecter(progres);
    await super.preparer(progres);
  }
  // personne d'autre que Haythem au départ : les autres arrivent par le réseau
  peupler() {
    const d0 = departs(this.zone, 'chasseurs', 1, this.rng)[0];
    this.N = 1; this.nC = 1; this.chasseurSeul = false; this.roleH0 = 'prop';
    const L = this.ajouterActeur({ id: 0, nom: this.pseudo, fiche: FICHE_HAYTHEM, equipe: 'props', role: 'prop', local: true, humain: true, x: d0.x, y: d0.y, z: d0.z, lacet: 0 });
    L.netId = this.reseau.id;
    this.sur('touche', (e) => this._surTouche(e));
    this.sur('elim', (e) => this._surElim(e));
    const p = this._lieuxProps(1)[0];
    this._poserRole(L, 'prop', p);
    this.phaseVers('attente', 0);
    this.annonce('PROP HUNT EN LIGNE · EN ATTENTE D’UN AUTRE ÉLÈVE', 'info');
    this._roleVu = L.role;
  }
  titrePause() { return `PROP HUNT EN LIGNE · ${this.phase === 'attente' ? 'EN ATTENTE' : `MANCHE ${this.manche} / ${this.nManches}`} · ${this.reseau ? this.reseau.presents.length : 1} ÉLÈVE(S)`; }

  // ---------------------------------------------------------------- les acteurs distants
  _defArrivee(s) { return { equipe: s.ro === 'chasseur' ? 'chasseurs' : 'props', role: 'chasseur', dotation: DOTATION_CHASSEUR }; }
  _apresArrivee(a, s) {
    a.pool = true; a._arsenalChasseur = a.arsenal;
    this._poserRole(a, s.ro === 'chasseur' ? 'chasseur' : 'prop', { x: s.x, y: s.y, z: s.z, lacet: s.l || 0 });
    a.cerveau?.liberer?.(); a.cerveau = null; a.gele = false; if (a.arsenal) a.arsenal.bloque = true;
    this.annonce(`${a.nom.toUpperCase()} REJOINT LA PARTIE`, 'info');
  }
  // son RÔLE et sa FORME, d'après son état : un changement de rôle (nouvelle manche) pose son corps ; un meuble neuf le
  // déguise ICI sans regarder la place (c'est chez lui qu'elle a été vérifiée) ; redevenu humain, son Player revient
  _poserExtra(a, q) {
    const ro = q.ro === 'chasseur' ? 'chasseur' : 'prop';
    if (ro !== a.role) {
      this._poserRole(a, ro, { x: q.x, y: q.y, z: q.z, lacet: q.l || 0 });
      a.cerveau?.liberer?.(); a.cerveau = null; a.gele = false; if (a.arsenal) a.arsenal.bloque = true;
      if (!q.v) a.mourir(this.t);
    }
    if (q.k && (!a.prop || a.prop.cle !== q.k)) {
      const p = this._sansCollisions || (this._sansCollisions = Object.create(this, { game: { value: { collisions: null } } }));
      a.corps.pos.set(q.x, q.y, q.z);
      if (a.corps === a.joueur) { const c = a._corpsProp || (a._corpsProp = this._nouveauCorpsProp()); a.changerCorps(c); }
      deguiser(p, a, q.k);
    } else if (!q.k && a.prop) { retirerProp(this, a); if (a.joueur) a.changerCorps(a.joueur); }
    if (a.prop) { if (Number.isFinite(q.pc)) a.prop.cap = q.pc; a.prop.fige = !!q.fg; }
  }
  _etatExtra(s) {
    const L = this.local, P = L && L.prop;
    s.ro = L ? L.role : 'prop'; s.k = P ? P.cle : null; s.pc = P ? r3(P.cap || 0) : null; s.fg = !!(P && P.fige);
  }
  // (les acteurs distants ne sont jamais figés ici : leur PC décide ; leur arme non plus ne tire pas ici)
  _majGeles() {
    if (this.phase === 'attente') { for (const a of this.acteurs) { a.gele = a.distant ? false : false; if (a.arsenal) a.arsenal.bloque = true; } return; }
    super._majGeles();
    for (const a of this.acteurs) if (a.distant) { a.gele = false; if (a.arsenal) a.arsenal.bloque = true; }
  }
  // (les provocations obligatoires d'un distant, c'est son PC qui les fait — on les entend par `fx`)
  _provoquer(a, n, forcee) { if (a.distant) return false; return super._provoquer(a, n, forcee); }

  // ---------------------------------------------------------------- LES MANCHES, menées par le plus ancien
  get _meneur() { return !!(this.reseau && this.reseau.suisAncien); }
  // les joueurs (ids réseau) dans l'ordre d'arrivée au salon : le même ordre chez tout le monde
  _joueurs() {
    const R = this.reseau, ici = new Set([R.id, ...this._dist.keys()]);
    return R.presents.filter((id) => ici.has(id));
  }
  _tirerRoles(manche) {
    const J = this._joueurs(), n = J.length, nC = Math.max(1, Math.round(n / 3)), roles = {};
    for (let k = 0; k < n; k++) roles[J[k]] = 'prop';
    for (let k = 0; k < nC; k++) roles[J[((manche - 1) * nC + k) % n]] = 'chasseur';
    return roles;
  }
  _netDe(a) { return a.local ? this.reseau.id : a.netId; }
  // UNE MANCHE : les rôles reçus (ou tirés par le meneur), chacun posé à son départ — Haythem au sien, les autres là où leur
  // état les dira —, la présentation
  _debutManche() {
    // (le meneur tire les rôles de la manche et les envoie — y compris quand les règles enchaînent seules après la révélation)
    if (this._meneur && !this._depuisMessage) {
      const R = this._tirerRoles(this.manche);
      this._roles = new Map(Object.entries(R));
      this.reseau.envoyer({ t: 'manche', manche: this.manche, nM: this.nManches, roles: R });
    }
    const g = this.game, loc = this.local, roles = this._roles;
    const C = [], P = [];
    for (const a of this.acteurs) (roles.get(this._netDe(a)) === 'chasseur' ? C : P).push(a);
    const dC = departs(this.zone, 'chasseurs', Math.max(1, C.length), this.rng), dP = this._lieuxProps(Math.max(1, P.length));
    for (const d of dC) this._regardDepart(d);
    C.forEach((a, k) => this._poserRole(a, 'chasseur', dC[k % dC.length]));
    P.forEach((a, k) => this._poserRole(a, 'prop', dP[k % dP.length]));
    for (const a of this.acteurs) if (a.distant) { a.cerveau?.liberer?.(); a.cerveau = null; }
    this.roleH = loc ? loc.role : null;
    if (loc) {
      const d = loc.role === 'chasseur' ? dC[C.indexOf(loc) % dC.length] : dP[P.indexOf(loc) % dP.length];
      g.camYaw = d.lacet || 0; g.camPitch = loc.role === 'prop' ? 0.3 : 0;
      this.suivi = loc;
    }
    this._regardFixe = null; this.gagnantManche = null; this.chrono = 0;
    this.roue.ouverte = false; this.roue.choix = -1;
    this.phaseVers('presentation', REGLAGES_PROP.presentation);
    this._majGeles();
    const n = `MANCHE ${this.manche} / ${this.nManches}`;
    this.annonce(!loc ? n : loc.role === 'prop' ? `${n} · TU ES PROP — CACHE-TOI !` : `${n} · TU ES CHASSEUR — ILS SE CACHENT`, 'info');
  }
  _lancerManche(manche) { this.manche = manche; this.resultats = []; this._debutManche(); }
  // le meneur dit chaque phase (la révélation avec le gagnant de la manche) ; les autres la reçoivent
  phaseVers(phase, duree) {
    super.phaseVers(phase, duree);
    if (this._meneur && this.reseau && (phase === 'cachette' || phase === 'traque' || phase === 'revelation' || phase === 'fin'))
      this.reseau.envoyer({ t: 'phase', phase, manche: this.manche, g: this.gagnantManche || null });
  }
  _recevoirAutre(m) {
    const R = this.reseau;
    if (m.t === 'manche') {
      if (m.vers && m.vers !== R.id) return;
      const roles = m.roles && typeof m.roles === 'object' ? m.roles : {};
      this.nManches = Math.max(1, Math.min(12, m.nM | 0 || this.nManches)); this.manche = Math.max(1, m.manche | 0);
      this._roles = new Map(Object.entries(roles).filter(([, r]) => r === 'chasseur' || r === 'prop'));
      this._depuisMessage = true;
      try { this._debutManche(); } finally { this._depuisMessage = false; }
      // (arrivé en cours de manche : on la regarde, on jouera la suivante)
      if (m.phase === 'traque' || m.phase === 'revelation') { if (this.local) { this.local.mourir(this.t); this.annonce('MANCHE EN COURS · TU JOUES LA SUIVANTE', 'info'); } this.phaseVers(m.phase, 0); }
      else if (m.phase === 'cachette') this.phaseVers('cachette', this.dureesZone[0]);
    } else if (m.t === 'phase' && !this._meneur) {
      if (m.phase === 'cachette' && this.phase === 'presentation') this.phaseVers('cachette', this.dureesZone[0]);
      else if (m.phase === 'traque' && (this.phase === 'cachette' || this.phase === 'presentation')) this._lacher();
      else if (m.phase === 'revelation' && this.phase !== 'revelation' && this.phase !== 'fin') this._finirDe(m.g === 'chasseurs' ? 'chasseurs' : 'props');
      else if (m.phase === 'fin' && this.phase !== 'fin') this._terminer();
    } else if (m.t === 'join' && m.id !== R.id && this._meneur && this.phase !== 'attente') {
      // (le nouveau venu reçoit la manche en cours, et où elle en est)
      const roles = {}; for (const [k, v] of this._roles) roles[k] = v; roles[m.id] = 'prop';
      this._roles.set(m.id, 'prop');
      R.envoyer({ t: 'manche', vers: m.id, manche: this.manche, nM: this.nManches, roles, phase: this.phase });
    }
  }
  _finirDe(g) { this._fin = true; try { super._finir(g); } finally { this._fin = false; } }
  // la fin de manche et la fin de partie : décidées par le meneur seul (les autres les reçoivent : `phase`)
  _finir(g) { if (this._meneur || this._fin) return super._finir(g); }
  _verifierFin() { if (this._meneur) super._verifierFin(); }
  regles(dt) {
    if (this.phase === 'attente') {
      this._majGeles();
      if (this.local) this._actionsProp(this.local);
      if (this._meneur && this._joueurs().length >= 2) this._lancerManche(1);
      return;
    }
    if (this.phase === 'fin') return;
    // (le meneur : toutes les règles, ses transitions partent par phaseVers ; un autre : les mêmes règles sans les transitions)
    if (this._meneur) {
      // (tout le monde est parti en pleine manche : retour à l'attente)
      if (this._joueurs().length < 2 && this.phase !== 'revelation') { this.phaseVers('attente', 0); this.annonce('EN ATTENTE D’UN AUTRE ÉLÈVE', 'info'); return; }
      return super.regles(dt);
    }
    const ph = this.phase, [tC, tT] = this.dureesZone;
    for (const a of this.acteurs) if (a.prop && a.vivant) a.prop.pv = a.vie;
    for (const a of this.acteurs) if (a.vivant && !a.distant) { if (a.role === 'prop') this._actionsProp(a); else if (a.role === 'chasseur') this._actionsChasseur(a); }
    if (ph === 'cachette') this.chrono = Math.max(0, tC - this.phaseT);
    else if (ph === 'traque') { this.chrono = Math.max(0, tT - this.phaseT); this._traque(dt); }
    this._majGeles();
    if (this.local && !this.local.vivant) this._spectateur();
  }
}
