// =====================================================================
//  LES SÉRIES, LES MÉDAILLES, LES ACCESSOIRES ET LES ATOUTS — lot L-P (vague 3, 24/10 ; spec §§ 3.3, 3.5, 5.7.3 ; CoD §§ 7.7, 11)
// =====================================================================
// Ce que la PROGRESSION change à la simulation du combat — et rien d'autre : un fichier de SIMULATION (§ 4.1 règle 4 : ni
// hasard du navigateur, ni horloge, ni entrées, ni affichage — le hasard est `melanger(graine, …)`, le temps `partie.t`, les
// entrées la commande `serie` ; ce qu'on voit des séries est dans js/jeu/aff_progression.js, abonné aux événements).
//   - Les ACCESSOIRES (un, sur l'arme principale) et les ATOUTS (un) d'une classe : des FICHES D'ARME RECOPIÉES et retouchées
//     (`ficheEquipee`) que l'Arsenal lit comme les autres — il ne sait rien d'eux (js/jeu/armes.js n'est pas à ce lot) :
//     point rouge (zoom × 1,30), poignée (recul × 0,8, visée + 0,02 s), chargeur étendu (+ 50 %, visée + 0,04 s, recharge
//     + 0,2 s), silencieux (bruit 45 → 8 m, aucun point sur la mini-carte, paliers de distance − 15 %) ; Main sûre (recharge
//     × 0,75, changement × 0,8). Les autres atouts sont lus par les règles (js/jeu/partie_fps.js) : Endurance (le sprint
//     tactique dure deux fois plus, sa jauge se recharge deux fois plus vite), Pas feutrés (les pas portent trois fois moins
//     loin), Récupération (la vie remonte à 2,5 s), Fantôme (aucun drone ne le voit).
//   - Les SÉRIES, par vie (les éliminations de l'arme en main ; celles de la sentinelle ne comptent pas, comme dans Call of
//     Duty) : 3 le DRONE (25 s ; l'équipe voit les ennemis sur la mini-carte toutes les 2 s, sauf Fantôme ; un drone de bot
//     nourrit la mémoire d'équipe de ses alliés toutes les 3 s : `partie.signaler`, c'est leur radar, pas une triche), 5 le
//     GILET (+ 60 d'armure, prise AVANT la vie), 7 la SENTINELLE (une tourelle posée devant soi, 40 s ou 300 PV, qui repère
//     et tire comme un Régulier à ≤ 25 m sur 180°). Une série atteinte reste à prendre (touches 3 / 4 / 5, la croix) jusqu'à
//     ce qu'on la lance, mort comprise ; le compteur, lui, repart à zéro à la mort. Les bots n'ont que le drone, lancé dès
//     qu'il est gagné.
//   - Les 16 MÉDAILLES (CoD § 7.7, et une seizième : TROUBLE-FÊTE, casser la série d'un autre — le § 7.7 en nomme quinze),
//     chacune un événement `medaille` { a, id, xp } que le profil et le HUD lisent.
// Événements émis : `serie` { a, id, n, etat: 'atteinte' | 'lancee' | 'finie' | 'detruite' | 'refusee', xp } · `medaille` · `tir`
// et `trajet` de la sentinelle (son id à elle, ≥ 1000 : ni les effets ni les sons des acteurs ne la prennent pour son
// propriétaire ; `par` = le propriétaire, à qui vont ses touches et ses éliminations, arme 'sentinelle').
import { ARMES } from './armes.js';
import { Rng, melanger } from './rng.js';

const DEG = Math.PI / 180, INF = Infinity;
const angle = (a) => Math.atan2(Math.sin(a), Math.cos(a));

// ---------------------------------------------------------------- LES ACCESSOIRES (CoD § 11 ; un par classe, sur la principale)
export const ACCESSOIRES = {
  pointRouge: { id: 'pointRouge', nom: 'Point rouge', niveau: 10, armes: ['fa24', 'pm9', 'fp12', 'p17'], zoom: 1.30,
    texte: 'Une visée plus serrée : zoom × 1,30 en visée.' },
  poignee: { id: 'poignee', nom: 'Poignée', niveau: 12, armes: ['fa24', 'pm9', 'fp12', 'tp50', 'p17'], recul: 0.8, ads: 0.02,
    texte: 'Le recul × 0,8 ; la visée vient 0,02 s plus tard.' },
  chargeur: { id: 'chargeur', nom: 'Chargeur étendu', niveau: 14, armes: ['fa24', 'pm9', 'fp12', 'tp50', 'p17'], chargeur: 1.5, ads: 0.04, recharge: 0.2,
    texte: '50 % de balles en plus ; visée + 0,04 s, recharge + 0,2 s.' },
  silencieux: { id: 'silencieux', nom: 'Silencieux', niveau: 16, armes: ['fa24', 'pm9', 'tp50', 'p17'], bruit: 8, paliers: 0.85,
    texte: 'Le tir s’entend à 8 m et ne te montre plus sur la mini-carte ; la portée des dégâts − 15 %.' },
};
// ---------------------------------------------------------------- LES VISEURS (27/10 : changés en partie, sur la principale)
// Le viseur est à part des accessoires (on peut avoir une poignée ET un point rouge) : le zoom en visée et le temps de visée ;
// ce qu'on en voit est dans js/jeu/viseurs.js. `null` : les organes de visée d'origine (la hausse et le guidon).
export const VISEURS = {
  pointRouge: { id: 'pointRouge', nom: 'Point rouge', court: 'POINT ROUGE', zoom: 1.30, ads: 0.0, armes: ['fa24', 'pm9', 'fp12'],
    texte: 'Un point lumineux au centre, rien devant l’œil : zoom × 1,30.' },
  holo: { id: 'holo', nom: 'Holographique', court: 'HOLO', zoom: 1.40, ads: 0.02, armes: ['fa24', 'pm9', 'fp12'],
    texte: 'Une grande fenêtre et son cercle : zoom × 1,40, visée + 0,02 s.' },
  lunette: { id: 'lunette', nom: 'Lunette × 3', court: 'LUNETTE ×3', zoom: 3.0, ads: 0.07, armes: ['fa24', 'pm9'],
    texte: 'Grossit trois fois, le chevron pour viser loin : visée + 0,07 s.' },
};
// ---------------------------------------------------------------- LES ATOUTS (CoD § 11 ; un par classe)
export const ATOUTS = {
  endurance: { id: 'endurance', nom: 'Endurance', niveau: 18, tactDuree: 2, tactRecharge: 0.5,
    texte: 'Le sprint tactique dure deux fois plus longtemps (6 s) et sa jauge se recharge deux fois plus vite.' },
  mainSure: { id: 'mainSure', nom: 'Main sûre', niveau: 20, recharge: 0.75, changement: 0.8,
    texte: 'Recharges × 0,75, changement d’arme × 0,8.' },
  pasFeutres: { id: 'pasFeutres', nom: 'Pas feutrés', niveau: 22, audition: 1 / 3,
    texte: 'Les bots t’entendent courir trois fois moins loin.' },
  recuperation: { id: 'recuperation', nom: 'Récupération', niveau: 24, regenDelai: 2.5,
    texte: 'La vie remonte 2,5 s après le dernier coup au lieu de 4.' },
  fantome: { id: 'fantome', nom: 'Fantôme', niveau: 26, invisibleDrone: true,
    texte: 'Invisible aux drones ennemis.' },
};
// le rayon d'audition des pas par les bots (§ 3.1 : sprint 14 m, course 9, marche 4, accroupi 0), posé sur chaque
// événement `pas` du combat (`e.rayon`, ÷ 3 avec Pas feutrés) par js/jeu/partie_fps.js
export const RAYONS_PAS = { sprint: 14, tact: 14, course: 9, marche: 4, accroupi: 0 };

// UNE FICHE D'ARME ÉQUIPÉE : la fiche de base recopiée (ses tableaux et ses blocs recopiés quand on les change : la fiche
// de js/jeu/armes.js n'est jamais touchée — les bots la partagent), retouchée par l'accessoire (s'il va sur cette arme) et
// par Main sûre. Même `id` que la base (les modèles, les sons, le HUD la reconnaissent) ; `base`, `accessoire`, `atout` en plus.
export function ficheEquipee(base, accessoire = null, atout = null, viseur = null) {
  if (!base) return base;
  const A = accessoire && ACCESSOIRES[accessoire] && ACCESSOIRES[accessoire].armes.includes(base.id) ? ACCESSOIRES[accessoire] : null;
  const M = atout === 'mainSure' && base.recharge ? ATOUTS.mainSure : null;
  // (le point rouge des accessoires de L-P se voit aussi : c'est le viseur « point rouge »)
  const vId = viseur || (A && A.id === 'pointRouge' ? 'pointRouge' : null);
  const S = vId && VISEURS[vId] && VISEURS[vId].armes.includes(base.id) ? VISEURS[vId] : null;
  if (!A && !M && !S) return base;
  const f = { ...base, base: base.id, accessoire: A ? A.id : null, atout: M ? M.id : null, viseur: S ? S.id : null };
  if (A && A.zoom) f.zoom = A.zoom;
  if (S) { f.zoom = S.zoom; f.ads = base.ads + S.ads; }
  if (A && A.recul && base.recul) {
    const k = A.recul, R = base.recul;
    f.recul = { ...R, v: R.v.map((x) => x * k), h: R.h.map((x) => x * k), alea: R.alea * k, aleaH: (R.aleaH || 0) * k, cabre: R.cabre * k, piston: R.piston * k };
  }
  if (A && A.ads) f.ads += A.ads;
  if (A && A.chargeur) f.chargeur = Math.round(base.chargeur * A.chargeur);
  if (A && A.recharge && base.recharge) {
    const R = base.recharge;
    f.recharge = R.parCartouche ? { ...R, debut: R.debut + A.recharge } : { ...R, tact: R.tact + A.recharge, vide: R.vide + A.recharge, ajout: R.ajout + A.recharge };
  }
  if (A && A.bruit) {
    f.bruit = A.bruit; f.silencieux = true;
    f.degats = base.degats.map(([d, v]) => [d === INF ? INF : d * A.paliers, v]);
  }
  if (M) {
    const R = f.recharge, k = M.recharge;
    f.recharge = R.parCartouche ? { ...R, debut: R.debut * k, parCartouche: R.parCartouche * k, fin: R.fin * k, pompe: R.pompe * k }
      : { ...R, tact: R.tact * k, vide: R.vide * k, ajout: R.ajout * k };
    f.sortie = base.sortie * M.changement; f.rangement = base.rangement * M.changement;
  }
  return f;
}
// L'ARSENAL ÉQUIPÉ : ses fiches remplacées (l'accessoire sur la principale, l'atout partout), puis rempli (le chargeur
// étendu entre au chargeur de départ). `modificateurs` gardés sur l'arsenal (le contrat du § 4.5.6 les y range).
export function equiperArsenal(arsenal, eq) {
  if (!arsenal) return arsenal;
  const acc = (eq && eq.accessoire) || null, atout = (eq && eq.atout) || null;
  arsenal.modificateurs = { accessoire: acc, atout };
  arsenal.armes = arsenal.armes.map((f) => ficheEquipee(ARMES[f.base || f.id] || f, f.emplacement === 'principale' ? acc : null, atout));
  arsenal.remplir();
  return arsenal;
}

// ---------------------------------------------------------------- LES SÉRIES (CoD § 11)
export const SERIES = {
  drone: { id: 'drone', n: 3, cle: 1, nom: 'DRONE DE SURVEILLANCE', court: 'DRONE', duree: 25, balayage: 2, balayageBots: 3,
    texte: 'Les ennemis sur la mini-carte toutes les 2 s pendant 25 s.' },
  gilet: { id: 'gilet', n: 5, cle: 2, nom: 'GILET PARE-BALLES', court: 'GILET', armure: 60,
    texte: '60 points d’armure, pris avant la vie.' },
  // la tourelle : posée à 1,1 m devant soi (0,8 puis 0,5 si c'est encombré), œil à 1 m ; elle REPÈRE comme un Régulier
  // (jauge 0,45 s à ≤ 10 m, f(d) du § 3.7) PUIS réagit (0,45 s), tourne à 300°/s, tire par rafales de 4 à 7 avec 0,45 s de
  // pause ; l'erreur de chaque balle suit une loi de Rayleigh de MÉDIANE `erreur` (°), réglée pour 25 % de touches sur un
  // homme debout à 10 m (§ 5.7.3 point 5 : mesuré par le test 5 — le 24/10, quatre graines × 240 balles : 3,4° → 15,7 %,
  // 2,4° → 23,6 % puis 26 à 37 %, 2,75° → 20 à 28,5 % (24 en moyenne) ; 2,65° retenu)
  sentinelle: { id: 'sentinelle', n: 7, cle: 3, nom: 'SENTINELLE', court: 'SENTINELLE', duree: 40, vie: 300, portee: 25, demiCone: 90,
    oeil: 1.0, avance: [1.1, 0.8, 0.5], rayon: 0.3, haut: 1.15, tReperage: 0.45, reaction: 0.45, rotation: 300, erreur: 2.65,
    rafale: [4, 7], pause: 0.45, rpm: 600, perception: 12, oubli: 0.6, texte: 'Une tourelle devant toi, 40 s ou 300 PV : elle tire comme un bot Régulier à 25 m.' },
};
export const ORDRE_SERIES = ['drone', 'gilet', 'sentinelle'];
// l'expérience d'une longueur de série (CoD § 11 : 3, 5, 7… → 50 × la longueur)
export const xpSerie = (n) => (n >= 3 && n % 2 === 1 ? 50 * n : 0);
// la fiche de la sentinelle (ses balles passent par Partie.resoudreTir comme les autres)
export const FICHE_SENTINELLE = { id: 'sentinelle', nom: 'Sentinelle', classe: 'serie', emplacement: 'serie', auto: true, rpm: 600,
  degats: [[15, 24], [25, 20], [INF, 0]], plombs: 1, zones: { tete: 1.4, cou: 1.2, torse: 1.1, ventre: 1.0, jambes: 0.9 }, bruit: 40, portee: 30 };

// ---------------------------------------------------------------- LES MÉDAILLES (CoD § 7.7 ; xp de 25 à 100)
// (`nomA` : l'habillage Airsoft, sans sang)
export const MEDAILLES = {
  premierSang: { nom: 'PREMIER SANG', nomA: 'PREMIÈRE TOUCHE', xp: 50, texte: 'La première élimination de la partie.' },
  tete: { nom: 'TIR À LA TÊTE', xp: 25, texte: 'Une élimination d’une balle à la tête.' },
  double: { nom: 'DOUBLÉ', xp: 50, texte: 'Deux éliminations en moins de 4 s.' },
  triple: { nom: 'TRIPLÉ', xp: 75, texte: 'Trois éliminations, chacune à moins de 4 s de la précédente.' },
  furie: { nom: 'FURIE', xp: 100, texte: 'Quatre éliminations à la suite, à moins de 4 s l’une de l’autre.' },
  vengeance: { nom: 'VENGEANCE', xp: 50, texte: 'Éliminer celui qui t’a éliminé.' },
  sauvetage: { nom: 'SAUVETAGE', xp: 50, texte: 'Éliminer un ennemi qui venait de toucher un allié.' },
  loin: { nom: 'LONGUE DISTANCE', xp: 50, texte: 'Une élimination à plus de 30 m.' },
  boutPortant: { nom: 'À BOUT PORTANT', xp: 25, texte: 'Une élimination à moins de 2 m, sans le couteau.' },
  couteau: { nom: 'AU COUTEAU', xp: 50, texte: 'Une élimination au couteau.' },
  serie5: { nom: 'SÉRIE DE 5', xp: 75, texte: 'Cinq éliminations sans mourir.' },
  serie10: { nom: 'SÉRIE DE 10', xp: 100, texte: 'Dix éliminations sans mourir.' },
  capture: { nom: 'CAPTURE', xp: 25, texte: 'Prendre un point en domination.' },
  neutralisation: { nom: 'NEUTRALISATION', xp: 25, texte: 'Neutraliser un point adverse.' },
  defense: { nom: 'DÉFENSE', xp: 50, texte: 'Une élimination sur un point que ton équipe tient.' },
  troubleFete: { nom: 'TROUBLE-FÊTE', xp: 50, texte: 'Éliminer un adversaire qui tenait une série de 3 ou plus.' },
};
export const REGLES_MEDAILLES = { enchainement: 4, loin: 30, boutPortant: 2, sauvetage: 3, troubleFete: 3 };

const ouvert = () => ({ vie: 0, chaine: 0, tChaine: -INF, tueur: -1, dispo: [] });

// LES SÉRIES D'UNE PARTIE : les compteurs par acteur, les drones en vol, les sentinelles posées, les médailles.
export class Series {
  constructor(partie) {
    this.partie = partie;
    this.acteurs = new Map();          // id → { vie, chaine, tChaine, tueur, dispo: [ids de série gagnés, pas lancés] }
    this.drones = [];                  // [{ a, eq, fin, prochain, vus: [[id, x, y, z]] }]
    this.sentinelles = [];             // voir lancer()
    this.touches = [];                 // [{ par, cible, t }] : les 3 dernières secondes (le sauvetage)
    this.premier = false; this.n = 0;
    this._des = []; this._r = {};
  }
  brancher() {
    const P = this.partie;
    this.debrancher();
    this._des.push(P.sur('elim', (e) => this._elim(e)), P.sur('touche', (e) => this._touche(e)), P.sur('score', (e) => this._score(e)),
      P.sur('explosion', (e) => this._explosion(e)));
  }
  debrancher() { for (const d of this._des) d(); this._des = []; }
  de(id) { let x = this.acteurs.get(id); if (!x) { x = ouvert(); this.acteurs.set(id, x); } return x; }
  // l'atout d'un acteur (posé par js/jeu/partie_fps.js : acteur.atout)
  static atout(a) { return (a && a.atout) || null; }

  // ---------------------------------------------------------------- LES ÉLIMINATIONS : séries et médailles
  _elim(e) {
    const P = this.partie, t = P.t;
    const tueur = e.par >= 0 ? P.acteurParId(e.par) : null, cible = P.acteurParId(e.cible);
    if (!cible || cible.role === 'cible') return;
    const C = this.de(cible.id), serieCible = C.vie;
    C.vie = 0; C.chaine = 0; C.tChaine = -INF;
    if (P.phase !== 'manche') { if (tueur && tueur !== cible) C.tueur = tueur.id; return; }
    if (!tueur || tueur === cible) return;                  // (un suicide : ni série ni médaille)
    C.tueur = tueur.id;
    const K = this.de(tueur.id), R = REGLES_MEDAILLES, sent = e.arme === 'sentinelle', M = [];
    if (!sent) { K.chaine = t - K.tChaine <= R.enchainement + 1e-9 ? K.chaine + 1 : 1; K.tChaine = t; K.vie++; }
    if (!this.premier) { this.premier = true; M.push('premierSang'); }
    if (e.tete) M.push('tete');
    if (!sent) { if (K.chaine === 2) M.push('double'); else if (K.chaine === 3) M.push('triple'); else if (K.chaine === 4) M.push('furie'); }
    if (K.tueur === cible.id) { M.push('vengeance'); K.tueur = -1; }
    if (this.touches.some((h) => h.par === cible.id && h.cible !== tueur.id && t - h.t <= R.sauvetage + 1e-9 && this._allie(tueur, h.cible))) M.push('sauvetage');
    const d = Math.hypot(tueur.pos.x - cible.pos.x, tueur.pos.y - cible.pos.y, tueur.pos.z - cible.pos.z);
    // (relecture : la distance d'une élimination de la sentinelle est celle de Haythem, pas d'elle — sa portée est de 25 m)
    if (d > R.loin && !sent) M.push('loin');
    if (d < R.boutPortant && e.arme !== 'couteau' && !sent) M.push('boutPortant');
    if (e.arme === 'couteau') M.push('couteau');
    if (serieCible >= R.troubleFete) M.push('troubleFete');
    if (!sent && K.vie === 5) M.push('serie5');
    if (!sent && K.vie === 10) M.push('serie10');
    for (const id of M) P.evt('medaille', { a: tueur.id, id, xp: MEDAILLES[id].xp });
    // LA SÉRIE : à 3, 5, 7, 9… (l'expérience), une récompense à 3, 5 et 7
    if (!sent && xpSerie(K.vie)) {
      const S = ORDRE_SERIES.map((k) => SERIES[k]).find((s) => s.n === K.vie) || null;
      const pour = S && (tueur.humain || S.id === 'drone') ? S.id : null;
      if (pour && !K.dispo.includes(pour)) K.dispo.push(pour);
      P.evt('serie', { a: tueur.id, n: K.vie, id: pour, etat: 'atteinte', xp: xpSerie(K.vie) });
      // (un bot lance son drone tout de suite)
      if (pour === 'drone' && !tueur.humain) this.lancer(tueur, 'drone');
    }
  }
  _allie(a, id) { const b = this.partie.acteurParId(id); return !!b && b !== a && b.vivant && !this.partie.ennemis(a, b); }
  _touche(e) {
    if (e.par < 0 || e.par === e.cible) return;
    const t = this.partie.t;
    this.touches.push({ par: e.par, cible: e.cible, t });
    while (this.touches.length && t - this.touches[0].t > REGLES_MEDAILLES.sauvetage + 1e-9) this.touches.shift();
    if (this.touches.length > 64) this.touches.shift();
  }
  // les médailles de la domination : la capture, la neutralisation, la défense (les points du barème viennent de PartieFPS)
  _score(e) {
    if (this.partie.phase !== 'manche' || e.id === null || e.id === undefined) return;
    const id = e.raison === 'capture' ? 'capture' : e.raison === 'neutralisation' ? 'neutralisation' : e.raison === 'elim' && e.defense ? 'defense' : null;
    if (id) this.partie.evt('medaille', { a: e.id, id, xp: MEDAILLES[id].xp });
  }

  // ---------------------------------------------------------------- LANCER une série (la commande `serie` 1-3, ou un bot)
  lancer(a, id) {
    const P = this.partie, S = SERIES[id], K = this.de(a.id), t = P.t;
    if (!S || !a.vivant) return false;
    const i = K.dispo.indexOf(id);
    if (i < 0) return false;
    if (id === 'drone') {
      this.drones.push({ a: a.id, eq: a.equipe, fin: t + S.duree, prochain: t, vus: [] });
    } else if (id === 'gilet') {
      a.armure = Math.max(a.armure || 0, S.armure);
    } else if (id === 'sentinelle') {
      const p = this._place(a);
      if (!p) { P.evt('serie', { a: a.id, n: K.vie, id, etat: 'refusee' }); return false; }
      this.sentinelles.push({ id: 1000 + this.n++, a: a.id, eq: a.equipe, x: p.x, y: p.y, z: p.z, cap: a.cmd.lacet, l: a.cmd.lacet, tg: 0, vie: S.vie,
        fin: t + S.duree, cible: -1, jauge: 0, repere: -1, rafale: 0, nRafale: 0, pause: 0, prochain: t, seq: 0, eh: 0, ev: 0 });
    }
    K.dispo.splice(i, 1);
    const s = id === 'sentinelle' ? this.sentinelles[this.sentinelles.length - 1] : null;
    P.evt('serie', { a: a.id, n: K.vie, id, etat: 'lancee', sentinelle: s ? s.id : undefined, x: s ? s.x : a.pos.x, y: s ? s.y : a.pos.y, z: s ? s.z : a.pos.z });
    return true;
  }
  // la place d'une sentinelle : devant soi (1,1 m, puis 0,8, 0,5), libre au rayon de la tourelle, au même sol, et qu'on
  // voit de l'œil (pas derrière une vitre ni à travers un poteau)
  _place(a) {
    const P = this.partie, C = P.game.collisions, S = SERIES.sentinelle, l = a.cmd.lacet, fx = -Math.sin(l), fz = -Math.cos(l), p = a.pos;
    for (const k of S.avance) {
      const x = p.x + fx * k, z = p.z + fz * k;
      const y = C ? C.solEn(x, z, p.y + 0.3) : p.y;
      if (Math.abs(y - p.y) > 0.35) continue;
      if (C && !C.libre(x, z, S.rayon, y)) continue;
      if (P.balistique && P.balistique.libre && !P.balistique.libre(p.x, p.y + 1.2, p.z, x, y + 0.6, z)) continue;
      return { x, y, z };
    }
    return null;
  }

  // ---------------------------------------------------------------- LE PAS (étape 8, pendant la manche)
  pas(dt) {
    const P = this.partie, t = P.t;
    // les commandes : `serie` 1-3 (un front) → la série de ce rang, si elle est à prendre
    for (const a of P.acteurs) if (a.vivant && a.cmd && a.cmd.serie >= 1 && a.cmd.serie <= 3) this.lancer(a, ORDRE_SERIES[a.cmd.serie - 1]);
    // les drones : un balayage toutes les 2 s (3 s pour la mémoire des bots)
    for (let i = this.drones.length - 1; i >= 0; i--) {
      const D = this.drones[i];
      if (t >= D.fin - 1e-9) { this.drones.splice(i, 1); P.evt('serie', { a: D.a, id: 'drone', etat: 'finie' }); continue; }
      if (t + 1e-9 < D.prochain) continue;
      const proprio = P.acteurParId(D.a), bot = !!proprio && !proprio.humain;
      D.prochain += bot ? SERIES.drone.balayageBots : SERIES.drone.balayage;
      D.vus = [];
      for (const b of P.acteurs) {
        if (!b.vivant || !b.corps || b.role === 'cible' || b.atout === 'fantome' || b.id === D.a) continue;
        if (!this._ennemiEquipe(D, b)) continue;
        D.vus.push([b.id, b.pos.x, b.pos.y, b.pos.z]);
        // (le radar des bots : la mémoire d'équipe — au chacun pour soi, la clé de l'acteur)
        if (bot) P.signaler(D.eq ?? 'acteur:' + D.a, b.id, b.pos.x, b.pos.y, b.pos.z);
      }
    }
    // les sentinelles
    let tirs = false;
    for (let i = this.sentinelles.length - 1; i >= 0; i--) {
      const s = this.sentinelles[i];
      if (s.vie <= 0) { this.sentinelles.splice(i, 1); continue; }
      if (t >= s.fin - 1e-9) { this.sentinelles.splice(i, 1); P.evt('serie', { a: s.a, id: 'sentinelle', etat: 'finie', sentinelle: s.id, x: s.x, y: s.y, z: s.z }); continue; }
      if (this._sentinelle(s, dt)) tirs = true;
    }
    // (ses dégâts DIFFÉRÉS appliqués tout de suite : l'étape 6b de ce pas est passée)
    if (tirs) P.appliquerEffets();
  }
  // b est-il un ennemi de l'équipe du drone D (au chacun pour soi : de son propriétaire) ?
  _ennemiEquipe(D, b) { return D.eq === null || D.eq === undefined ? b.id !== D.a : b.equipe !== D.eq; }
  _proprio(s) { return this.partie.acteurParId(s.a); }
  _ennemiSentinelle(s, b) {
    if (!b || !b.vivant || !b.corps || b.role === 'cible' || b.id === s.a) return false;
    return s.eq === null || s.eq === undefined ? true : b.equipe !== s.eq;
  }
  // UNE SENTINELLE, à chaque pas : perception (tous les 12 pas, décalée par son id), visée bornée, rafales
  _sentinelle(s, dt) {
    const P = this.partie, S = SERIES.sentinelle, B = P.balistique, t = P.t;
    const ox = s.x, oy = s.y + S.oeil, oz = s.z;
    if ((P.tick + 5 * s.id) % S.perception === 0) {
      // la cible : la plus proche qu'elle voit, dans son demi-plan (180°) et à ≤ 25 m — le corps d'un homme (jamais un meuble)
      let best = null, bd = INF;
      for (const b of P.acteurs) {
        if (!this._ennemiSentinelle(s, b) || b.corps !== b.joueur) continue;
        const bx = b.pos.x, by = b.pos.y + 1.27 * b.h / 1.73, bz = b.pos.z, d = Math.hypot(bx - ox, by - oy, bz - oz);
        if (d > S.portee) continue;
        if (Math.abs(angle(Math.atan2(-(bx - ox), -(bz - oz)) - s.cap)) > S.demiCone * DEG) continue;
        if (!B.vue(ox, oy, oz, bx, by, bz)) continue;
        if (d < bd) { bd = d; best = b; }
      }
      const dtP = S.perception / 120;
      if (best && best.id === s.cible) {
        const f = bd <= 10 ? 1 : bd <= 30 ? 1 - 0.5 * (bd - 10) / 20 : 0.5;
        const avant = s.jauge; s.jauge = Math.min(1, s.jauge + dtP / S.tReperage * f * (best.cmd && best.cmd.tir ? 2 : 1));
        if (avant < 1 && s.jauge >= 1) s.repere = t;
      } else if (best) { s.cible = best.id; s.jauge = Math.min(1, dtP / S.tReperage); s.repere = s.jauge >= 1 ? t : -1; s.rafale = 0; s.nRafale = 0; }
      // (perdue de vue : elle ne tire plus — le repérage retombe, et la cible s'oublie en 0,6 s)
      else { s.jauge = Math.max(0, s.jauge - dtP / S.oubli); if (s.jauge < 1) s.repere = -1; if (s.jauge <= 0) s.cible = -1; }
    }
    const c = s.cible >= 0 ? P.acteurParId(s.cible) : null;
    if (!c || !this._ennemiSentinelle(s, c)) { if (c) s.cible = -1; return false; }
    // la visée : la tête de la tourelle tourne vers le buste à 300°/s au plus
    const dx = c.pos.x - ox, dy = c.pos.y + 1.27 * c.h / 1.73 - oy, dz = c.pos.z - oz, dh = Math.hypot(dx, dz);
    const lv = Math.atan2(-dx, -dz), tv = Math.atan2(-dy, dh), pasMax = S.rotation * DEG * dt;
    const dl = angle(lv - s.l), dtg = tv - s.tg;
    s.l = angle(s.l + Math.max(-pasMax, Math.min(pasMax, dl))); s.tg += Math.max(-pasMax, Math.min(pasMax, dtg));
    const pret = Math.abs(dl) <= pasMax + 1e-6 && Math.abs(dtg) <= pasMax + 1e-6;
    if (s.repere < 0 || t - s.repere < S.reaction - 1e-9 || !pret) return false;
    if (s.pause > 0) { s.pause -= dt; return false; }
    if (t + 1e-9 < s.prochain) return false;
    // UNE BALLE : l'écart tiré (Rayleigh de médiane `erreur`), la balistique, la résolution des dégâts (différés)
    s.seq++;
    const R = new Rng(melanger(P.graine | 0, s.id, s.seq)), sig = S.erreur * DEG / Math.sqrt(2 * Math.log(2));
    const r = sig * Math.sqrt(-2 * Math.log(Math.max(1e-12, R.next()))), th = 2 * Math.PI * R.next();
    const l = s.l + r * Math.cos(th), tg = s.tg + r * Math.sin(th), ct = Math.cos(tg);
    const ddx = -Math.sin(l) * ct, ddy = -Math.sin(tg), ddz = -Math.cos(l) * ct;
    const proprio = this._proprio(s);
    if (!s.nRafale) s.nRafale = S.rafale[0] + R.int(S.rafale[1] - S.rafale[0] + 1);
    s.prochain = Math.max(s.prochain, t - 1 / 120) + 60 / S.rpm;
    P.evt('tir', { a: s.id, par: s.a, arme: 'sentinelle', ox, oy, oz, dx: ddx, dy: ddy, dz: ddz, n: 1, seq: s.seq });
    if (proprio) {
      const res = B.tirer(P, proprio, ox, oy, oz, ddx, ddy, ddz, FICHE_SENTINELLE.portee, this._r, 0);
      P.resoudreTir(proprio, FICHE_SENTINELLE, ox, oy, oz, ddx, ddy, ddz, res, 0);
      P.evt('trajet', { a: s.id, plomb: 0, ox, oy, oz, x: res.x, y: res.y, z: res.z, mat: res.mat });
    }
    if (++s.rafale >= s.nRafale) { s.rafale = 0; s.nRafale = 0; s.pause = S.pause; }
    return true;
  }
  // UNE BALLE CONTRE LES SENTINELLES : la plus proche coupée avant `tMax` (un cylindre de 0,3 m sur 1,15 m), d'un tireur
  // ennemi de son propriétaire → { s, t, x, y, z } | null
  toucherSentinelle(tireur, ox, oy, oz, dx, dy, dz, tMax) {
    let best = null, bt = tMax;
    const S = SERIES.sentinelle;
    for (const s of this.sentinelles) {
      if (s.vie <= 0 || !tireur || tireur.id === s.a || !this._ennemiSentinelle(s, tireur)) continue;
      // (le disque horizontal : (o + d t − c)² = r²)
      const px = ox - s.x, pz = oz - s.z, a = dx * dx + dz * dz, b = 2 * (px * dx + pz * dz), c = px * px + pz * pz - S.rayon * S.rayon;
      if (a < 1e-12) continue;
      const D = b * b - 4 * a * c; if (D < 0) continue;
      const q = Math.sqrt(D), t0 = (-b - q) / (2 * a), t1 = (-b + q) / (2 * a);
      for (const u of [t0, t1]) {
        if (u <= 0 || u >= bt) continue;
        const y = oy + dy * u;
        if (y < s.y || y > s.y + S.haut) continue;
        bt = u; best = { s, t: u, x: ox + dx * u, y, z: oz + dz * u };
        break;
      }
    }
    return best;
  }
  // des dégâts sur une sentinelle (Partie.appliquerEffet, genre 'sentinelle' ; ou une explosion)
  blesser(id, degats, par) {
    const P = this.partie, s = this.sentinelles.find((x) => x.id === id);
    if (!s || s.vie <= 0 || degats <= 0) return 0;
    const d = Math.min(s.vie, degats);
    s.vie -= d;
    P.evt('serie', { a: s.a, id: 'sentinelle', etat: s.vie <= 1e-9 ? 'detruite' : 'touchee', sentinelle: s.id, par, degats: d, x: s.x, y: s.y, z: s.z });
    if (s.vie <= 1e-9) { s.vie = 0; const k = P.acteurParId(par); if (k && P.phase === 'manche') { k.stats.score += 50; P.evt('score', { equipe: k.equipe, valeur: k.stats.score, id: k.id, points: 50, raison: 'sentinelle' }); } }
    return d;
  }
  // une frag près d'une sentinelle ennemie de son lanceur : 160 à ≤ 2 m, linéaire jusqu'à 25 à 6,5 m, ligne libre exigée
  _explosion(e) {
    if (e.arme !== 'frag' || !this.sentinelles.length) return;
    const P = this.partie, F = ARMES.frag, k = P.acteurParId(e.a);
    for (const s of this.sentinelles) {
      if (s.vie <= 0 || !k || !this._ennemiSentinelle(s, k)) continue;
      const d = Math.hypot(e.x - s.x, e.y - (s.y + 0.6), e.z - s.z);
      if (d > F.rMax) continue;
      if (P.balistique.libre && !P.balistique.libre(e.x, e.y + 0.3, e.z, s.x, s.y + 0.6, s.z)) continue;
      const deg = d <= F.rPlein ? F.degatsMax : F.degatsMax + (F.degatsMin - F.degatsMax) * (d - F.rPlein) / (F.rMax - F.rPlein);
      this.blesser(s.id, deg, k.id);
    }
  }
  // ce qu'une sentinelle a d'affichable (l'affichage : js/jeu/aff_progression.js)
  sentinellePar(id) { return this.sentinelles.find((s) => s.id === id) || null; }
  // les drones qui servent l'équipe de `a` (au chacun pour soi : les siens)
  dronesPour(a) {
    if (!a) return [];
    return this.drones.filter((D) => (a.equipe === null || a.equipe === undefined ? D.a === a.id : D.eq === a.equipe));
  }
  dronesContre(a) {
    if (!a) return [];
    return this.drones.filter((D) => D.a !== a.id && (a.equipe === null || a.equipe === undefined ? true : D.eq !== a.equipe));
  }
  // une mort ou une réapparition : l'armure du gilet ne survit pas à la vie (posé par les règles)
  remettre(a) { if (a) a.armure = 0; }
  // (relecture) LA MI-TEMPS de la domination — les camps s'échangent — : les drones et les sentinelles de la première moitié
  // s'en vont (une tourelle restée dans l'ancien camp de Haythem tirait sur les réapparitions d'en face) ; les séries à
  // prendre et les compteurs restent
  finirTout() {
    const P = this.partie;
    for (const D of this.drones) P.evt('serie', { a: D.a, id: 'drone', etat: 'finie' });
    for (const s of this.sentinelles) P.evt('serie', { a: s.a, id: 'sentinelle', etat: 'finie', sentinelle: s.id, x: s.x, y: s.y, z: s.z });
    this.drones = []; this.sentinelles = [];
  }

  // ---------------------------------------------------------------- L'ÉTAT (§ 4.7)
  etat() {
    const fin = (v) => (Number.isFinite(v) ? v : null);
    return { premier: this.premier, n: this.n,
      drones: this.drones.map((D) => ({ a: D.a, eq: D.eq, fin: D.fin, prochain: D.prochain, vus: D.vus.map((v) => v.slice()) })),
      sent: this.sentinelles.map((s) => ({ ...s })),
      touches: this.touches.map((h) => [h.par, h.cible, h.t]),
      act: [...this.acteurs].map(([id, x]) => [id, x.vie, x.chaine, fin(x.tChaine), x.tueur, x.dispo.slice()]) };
  }
  appliquer(e) {
    if (!e) return;
    this.premier = !!e.premier; this.n = e.n | 0;
    this.drones = (e.drones || []).map((D) => ({ ...D, vus: (D.vus || []).map((v) => v.slice()) }));
    this.sentinelles = (e.sent || []).map((s) => ({ ...s }));
    this.touches = (e.touches || []).map(([par, cible, t]) => ({ par, cible, t }));
    this.acteurs = new Map((e.act || []).map(([id, vie, chaine, tc, tueur, dispo]) => [id, { vie, chaine, tChaine: tc === null ? -INF : tc, tueur, dispo: dispo.slice() }]));
  }
}
