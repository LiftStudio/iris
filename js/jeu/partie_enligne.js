// =====================================================================
//  LE MATCH EN LIGNE (27/10/2026, « un serveur pour jouer en multijoueur, comme mon jeu de basket »)
// =====================================================================
// Un match à mort par équipes, SISR contre SLAM, entre de vrais élèves : chacun sur son PC, son téléphone, sa tablette,
// tous dans le même salon public du serveur (serveur/relais.js, dix au plus). Le mode du menu, EN LIGNE ; ?partie=enligne.
//
// QUI DÉCIDE QUOI — le principe des jeux de tir en ligne simples (et de LA CAGE) :
//   - CHACUN SIMULE SON SOLDAT, et lui seul : sa course, ses sauts, son arme, ses recharges. Il en envoie l'état (Acteur.etat
//     taillé : position, regard, posture, arme, vie) vingt fois par seconde (`pos`). Les autres le voient comme un acteur
//     `distant` — un corps de bot SANS cerveau, posé à chaque pas à l'état reçu, montré 110 ms en arrière et interpolé (deux
//     états qui encadrent l'heure montrée : le mouvement est lisse même si les paquets arrivent par à-coups).
//   - LE TIREUR VOIT SA BALLE TOUCHER, LA VICTIME COMPTE LES DÉGÂTS. Une balle de Haythem qui touche un acteur distant (la
//     balistique de sa propre partie, sur les positions qu'il voit) ne lui enlève rien ici : elle part en `touche` vers le PC
//     de la victime, qui l'applique à SON soldat (gilet, protection d'apparition, tir allié : ses règles à elle). Le marqueur
//     de touche, lui, s'allume tout de suite chez le tireur.
//   - LA VICTIME ANNONCE SA MORT (`elim`, à tous) : chacun la rejoue chez lui — le fil des éliminations, le score des deux
//     équipes, les médailles et les séries du tueur sur son PC à lui. Le score est donc le même partout, à une latence près.
//   - Les TIRS se voient et s'entendent chez les autres : les événements `tir`, `trajet` et `impact` de Haythem, groupés par
//     pas (`fx`), rejoués chez eux au nom de son acteur distant.
//   - Celui qui est là depuis le plus longtemps donne le score et le temps de jeu à chaque nouveau venu (`sync`).
// Pas de bots : rien que des élèves. Pas de pause non plus : la pause ouvre son écran, mais la partie continue (les autres,
// eux, jouent) — Haythem ne bouge plus et ne tire plus tant qu'elle est ouverte.
// Pas encore : les grenades des autres ne se voient pas voler (leurs dégâts, eux, arrivent bien), ni leurs séries.
import { PartieFPS } from './partie_fps.js';
import { FICHES_BOTS, FICHE_HAYTHEM } from './avatars.js';
import { ARMES } from './armes.js';
import { ficheEquipee } from './series.js';
import { CHAMPS_COMMANDE } from './commande.js';
import { EQUIPES } from './constantes.js';
import { Reseau, profilEnLigne } from './reseau.js';

const RETARD = 0.11;                 // s : l'état d'un autre est montré avec ce retard (deux paquets d'avance à 20 Hz)
const ENVOI = 1 / 20;                // s : un `pos` toutes les 50 ms
const FX = new Set(['tir', 'trajet', 'impact']);
const r3 = (v) => Math.round(v * 1000) / 1000;
const ang = (a, b, k) => { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return a + d * k; };

export class PartieEnLigne extends PartieFPS {
  constructor(game, opts, deps) {
    const tous = [FICHE_HAYTHEM.id, ...FICHES_BOTS.map((f) => f.id)];
    super(game, { presentation: 3, decompte: 3, scoreCible: 50, duree: 15 * 60, ...opts, mode: 'equipes', allies: 0, ennemis: 1,
      avatars: FICHES_BOTS.map((f) => f.id) }, deps);
    this.id = 'enligne'; this.enLigne = true; this.nomMode = 'En ligne · match à mort par équipes';
    this.effectifs = { ...this.effectifs, allies: 0, ennemis: 0, bots: 0 };
    const P = profilEnLigne();
    this.pseudo = String(this.opts.pseudo || P.pseudo).slice(0, 16);
    this.avatar = tous.includes(this.opts.avatar) ? this.opts.avatar : tous.includes(P.avatar) ? P.avatar : 'haythem';
    this.reseau = null; this._dist = new Map(); this._idDist = 100; this._dernierEnvoi = -1; this._fx = []; this._rejoue = false;
    this._tirTick = -1; this._synchro = false; this.vus = new Map();
  }
  // ---------------------------------------------------------------- se connecter avant d'entrer dans l'école
  async preparer(progres) {
    const pr = progres || (() => {});
    pr('Connexion au serveur', 0);
    this.reseau = new Reseau({ nom: this.pseudo, perso: { av: this.avatar } });
    const ok = await this.reseau.connecter(5000);
    if (!ok) { this.reseau.fermer(); throw new Error('[jeu] serveur en ligne injoignable — lance le jeu avec Lancer.bat (Node.js) ou donne ?serveur='); }
    pr('Connexion au serveur', 1);
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
  sortir() { try { this.reseau?.fermer(); } catch (e) { /* ignore */ } return super.sortir(); }

  // ---------------------------------------------------------------- le pas : lire le réseau, simuler, envoyer
  pas(dt) {
    if (this.reseau) this._lireReseau();
    super.pas(dt);
    if (this.reseau) this._envoyer();
  }
  // (la pause ne fige pas une partie en ligne : Haythem lâche tout tant qu'elle est ouverte — js/game.js fait avancer les pas)
  lireExtra(input, game, cmd) {
    if (!game.paused) return;
    for (const k of CHAMPS_COMMANDE) if (k !== 'lacet' && k !== 'tangage' && k !== 'seq') cmd[k] = typeof cmd[k] === 'number' ? (k === 'provoc' ? -1 : 0) : false;
  }
  // un acteur distant n'est ni gelé par la présentation ni ressuscité ici : c'est son PC qui décide
  _geler(v) { for (const a of this.acteurs) { if (a.distant) continue; a.gele = v; if (a.arsenal) a.arsenal.bloque = v; } }
  _reapparaitre(a) { if (a.distant) return false; return super._reapparaitre(a); }
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
        case 'sync': if (m.vers === R.id && !this._synchro) this._recevoirSync(m); break;
        case 'join': if (m.id !== R.id && R.suisAncien) this._donnerScore(m.id); break;
        case 'leave': this._partir(m.id); break;
        default: break;
      }
    }
    // (un élève dont on n'a plus de nouvelles depuis 6 s — onglet fermé sans `leave`, coupure — : retiré)
    const maintenant = performance.now() / 1000;
    for (const [id, a] of this._dist) if (maintenant - a._vuA > 6) this._partir(id);
    for (const a of this._dist.values()) this._vivantOuNon(a, maintenant);
  }
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
    for (const k of ['x', 'y', 'z', 'vx', 'vz', 'c', 'l', 'tg', 'jy', 'ac', 'gl', 'ax', 'ay', 'vie', 'ar']) if (s[k] !== undefined && !Number.isFinite(s[k])) return;
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
    if (s.eq !== a.equipe && (s.eq === 'A' || s.eq === 'B')) a.equipe = s.eq;
    a.nom = String(s.nom || a.nom).slice(0, 16);
  }
  // un élève qui arrive : son acteur, un corps de bot à son visage, sa dotation ; personne ne le commande ici
  _arrivee(id, s) {
    if (this._dist.size >= 12) return null;
    const base = FICHES_BOTS.find((f) => f.id === s.av) || FICHE_HAYTHEM;
    const ids = (s.w && Array.isArray(s.w.ids) ? s.w.ids : ['fa24', 'p17']).filter((x) => ARMES[x]);
    const dot = { principale: ids.find((x) => ARMES[x].emplacement === 'principale') || 'fa24', secondaire: ids.find((x) => ARMES[x].emplacement === 'secondaire') || 'p17',
      letale: null, tactique: null, couteau: true };
    const a = this.ajouterActeur({ id: this._idDist++, nom: String(s.nom || 'Élève').slice(0, 16), fiche: { ...base, nom: s.nom || base.nom }, equipe: s.eq === 'B' ? 'B' : 'A',
      x: s.x, y: s.y, z: s.z, lacet: s.l || 0, dotation: dot });
    a.distant = true; a.netId = id; a.cerveau = null; a._tampon = []; a._vuA = performance.now() / 1000;
    a.gele = false; if (a.arsenal) a.arsenal.bloque = true;
    this._ext(a); a._fiches = a.arsenal ? a.arsenal.armes.slice() : null;
    if (!s.v) { a.mourir(this.t); if (a.joueur && a.joueur.mesh) a.joueur.mesh.visible = false; }
    this._dist.set(id, a);
    this.annonce(`${a.nom.toUpperCase()} REJOINT LES ${(EQUIPES[a.equipe] || {}).nom || ''}`, 'info');
    return a;
  }
  _partir(id) {
    const a = this._dist.get(id); if (!a) return;
    this._dist.delete(id);
    if (a.poupee) { a.poupee.liberer?.(); a.poupee = null; }
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
    const p = s0.s, q = s1.s, c = a.corps;
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
    if (q.st) { a.stats.elims = q.st[0]; a.stats.morts = q.st[1]; }
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
  // ses tirs : rejoués ici au nom de son acteur (la lueur, le trajet, le bruit, l'impact sur le mur)
  _recevoirFx(m) {
    const a = this._dist.get(m.from); if (!a || !Array.isArray(m.L)) return;
    this._rejoue = true;
    try {
      for (const [type, d] of m.L) {
        if (!FX.has(type) || !d) continue;
        if (type === 'impact') super.evt('impact', d);
        else super.evt(type, { ...d, a: a.id });
      }
    } finally { this._rejoue = false; }
  }
  // une balle d'un autre qui touche Haythem : appliquée à son soldat, comme une balle de bot (5b du pas : l'effet différé)
  _recevoirTouche(m) {
    const a = this._dist.get(m.from), L = this.local;
    if (!a || !L || !L.vivant || !(m.d > 0)) return;
    this.differer({ genre: 'degats', cible: L.id, degats: Math.min(300, +m.d), par: a.id, arme: ARMES[m.arme] ? m.arme : null, zone: m.zone || 'torse',
      x: +m.x || 0, y: +m.y || 0, z: +m.z || 0, dx: +m.dx || 0, dy: +m.dy || 0, dz: +m.dz || 0, plomb: m.plomb, seq: m.seq });
  }
  // la mort d'un autre, annoncée par lui : rejouée ici (son corps tombe, le fil, le score de l'équipe, la médaille du tueur)
  _recevoirElim(m) {
    const cible = this._dist.get(m.from); if (!cible || !cible.vivant) return;
    const R = this.reseau, tireur = m.par === R.id ? this.local : m.par === m.from ? cible : this._dist.get(m.par) || null;
    cible.vie = 0; cible._aides = []; cible._mortTr = performance.now() / 1000;
    cible.mourir(this.t); cible.stats.morts++;
    if (tireur && tireur !== cible) { tireur.stats.elims++; if (m.tete) tireur.stats.tetes++; }
    const n = (v) => (Number.isFinite(+v) ? +v : 0);
    this.evt('elim', { par: tireur ? tireur.id : -1, cible: cible.id, arme: ARMES[m.arme] ? m.arme : null, tete: !!m.tete, x: cible.pos.x, y: cible.pos.y, z: cible.pos.z,
      ix: n(m.ix), iy: n(m.iy), iz: n(m.iz), assists: [], px: n(m.px) || cible.pos.x, py: n(m.py) || cible.pos.y + 1, pz: n(m.pz) || cible.pos.z });
  }
  _donnerScore(vers) {
    this.reseau.envoyer({ t: 'sync', vers, scores: this.scores ? { A: this.scores.A, B: this.scores.B } : null, tJeu: this.tJeu });
  }
  _recevoirSync(m) {
    this._synchro = true;
    if (m.scores && this.scores) { this.scores.A = Math.max(0, m.scores.A | 0); this.scores.B = Math.max(0, m.scores.B | 0); }
    if (Number.isFinite(m.tJeu) && m.tJeu > 0) { this.tJeu = Math.min(this.duree - 30, m.tJeu); this.chrono = Math.max(0, this.duree - this.tJeu); }
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
    R.envoyer({ t: 'pos', s: {
      nom: this.pseudo, av: this.avatar, eq: L.equipe, v: !!L.vivant,
      x: r3(c.pos.x), y: r3(c.pos.y), z: r3(c.pos.z), vx: r3(c.vel.x), vz: r3(c.vel.z), c: r3(c.ang || 0), l: r3(L.cmd.lacet), tg: r3(L.cmd.tangage),
      jy: r3(c.jumpY || 0), air: !!c.airborne, ac: r3(L.accroupi), gl: r3(L.glisse), vi: !!L.cmd.visee, sp: !!L.cmd.sprint, ax: r3(L.cmd.ax || 0), ay: r3(L.cmd.ay || 0),
      vie: Math.round(L.vie), ar: Math.round(L.armure || 0), pr: L.protegeT > this.t, st: [L.stats.elims, L.stats.morts],
      w: A ? { ids: A.armes.map((x) => x && (x.base || x.id)), i: A.i, vis: (f && f.viseur) || null, et: A.et, te: r3(Math.max(0, this.t - A.t0)), vk: r3(A.vk || 0),
        ch: A.chargeur, re: A.reserve } : null } });
  }
  // LES ÉVÉNEMENTS de Haythem qui partent : ses tirs (et les impacts de ses balles), sa mort
  evt(type, data) {
    const e = super.evt(type, data), L = this.local, R = this.reseau;
    if (!R || this._rejoue || !L) return e;
    if ((type === 'tir' || type === 'trajet') && data && data.a === L.id) {
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
  // (l'état d'une partie en ligne ne se rejoue pas : les autres n'y sont pas — le harnais garde le sien)
  infosPause() { const I = super.infosPause(); I.stats = [...(I.stats || [])]; return I; }
}
