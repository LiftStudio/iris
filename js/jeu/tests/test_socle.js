// =====================================================================
//  LES TESTS DU SOCLE (S0, 22/10 ; spec § 5.4, acceptation, points 1 à 26 ; § 6, la balade : 27 à 29)
// =====================================================================
// Lancés par le harnais sous `?test=1&rapport=1&lot=S0` (window.__rapport), PC puis `?tel=1`. Rejoués par TOUS les lots
// avant de finir (§ 5.1, règle 5b) : la balade au bit près, les entrées, les cycles de partie. Les tests ne cliquent jamais
// à l'écran : tout passe par window.__jeu. Un test rend { ok, attendu, obtenu }.
import * as THREE from 'three';
import { Rng, hacher } from '../rng.js';
import { PAS } from '../constantes.js';
import { settings, entree, ACTIONS } from '../../settings.js';
import { Player } from '../../player.js';
import { creerCorps, libererCorps, FICHE_HAYTHEM } from '../avatars.js';
import { MEUBLES } from '../../registre_meubles.js';
import { _refEstActeur } from '../deguisements.js';

const DEG = Math.PI / 180;
const r2 = (v) => Math.round(v * 100) / 100;
const egal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const sansEnfants = (o) => { const c = { ...o }; delete c.enfants; return c; };
const enfantsFixes = (g) => g.scene.children.filter((o) => !o.userData.suite).length;

// LES SIGNATURES du § 4.5, au caractère près : [module, export, membres] ; un membre « m(…) » est une méthode dont on
// compte les paramètres comme JavaScript (jusqu'au premier qui a une valeur par défaut, ou au reste) ; « get x » un
// accesseur ; « ?m(…) » une méthode FACULTATIVE de l'affichage (appelée avec ?.) ; une chaîne sans parenthèse, un export
// qui n'est pas une fonction.
const SIGNATURES = [
  ['constantes.js', 'PAS'], ['constantes.js', 'OEIL'], ['constantes.js', 'TANGAGE_MAX'], ['constantes.js', 'EQUIPES'], ['constantes.js', 'NIVEAUX'],
  ['constantes.js', 'niveauDe(y)'], ['constantes.js', 'BORNES_JEU'], ['constantes.js', 'LIMITES'], ['constantes.js', 'ZONES_JEU'], ['constantes.js', 'VERSION_ETAT'],
  ['commande.js', 'CHAMPS_COMMANDE'], ['commande.js', 'creerCommande()'], ['commande.js', 'viderFronts(c)'], ['commande.js', 'copierCommande(de, vers)'],
  ['commande.js', 'versTableau(c)'], ['commande.js', 'depuisTableau(t, c)'],
  ['rng.js', 'Rng', ['seed(s)', 'next()', 'range(a, b)', 'int(n)', 'pick(arr)', 'get etat', 'set etat']], ['rng.js', 'melanger(...entiers)'], ['rng.js', 'hacher(objet, precision = 1e-4)'],
  ['acteur.js', 'Acteur', ['constructor(partie, { id, nom, equipe = null, role = \'combattant\', fiche = null, local = false, humain = false })', 'get pos', 'oeil(out, affiche = false)', 'regard(out)', 'niveau()',
    'changerCorps(corps)', 'mourir(t)', 'reapparaitre(x, y, z, lacet, t)', 'etat()', 'appliquer(e)']],
  ['acteur.js', 'CorpsFixe', ['constructor(x = 0, y = 0, z = 0, cap = 0)', 'placer(x, y, z, cap)', 'memoriser()', 'presenter(a)']],
  ['partie.js', 'Partie', ['constructor(game, opts, deps)', 'get profil', 'preparer(progres)', 'entrer()', 'sortir()', 'pas(dt)', 'deplacer(a, dt)', 'regles(dt)', 'interpoler(a)',
    'camera(dt, poser)', 'image(dt)', 'majHud()', 'calme()', 'souris()', 'bornesTangage()', 'capturer()', 'besoinCapture()', 'attendreClic()', 'roueOuverte()',
    'mouvementSouris(dx, dy)', 'mouvementStick(x, y)', 'boutonsPause()', 'get jeuCarte', 'peutTirer(a)', 'lireExtra(input, game, cmd)',
    'resoudreTir(tireur, fiche, ox, oy, oz, dx, dy, dz, res, plomb)', 'differer(effet)', 'appliquerEffets()', 'appliquerEffet(e)',
    'infliger(cible, degats, { par, arme, zone, x, y, z, dx, dy, dz, plomb })', 'soigner(cible, pv, cause)', 'signaler(equipe, idCible, x, y, z)', 'signalements(equipe)',
    'phaseVers(phase, duree)', 'annonce(texte, cls)', 'ajouterActeur(def)', 'retirerActeur(a)', 'evt(type, data)', 'sur(type, fn)', 'etat()', 'appliquer(e)', 'empreinte()', 'static prerequis']],
  ['partie_essai.js', 'PartieEssai', ['regles(dt)']],
  ['index.js', 'MODES'], ['index.js', 'installerJeu(game, deps)'],
  ['armes.js', 'ARMES'], ['armes.js', 'CLASSES'], ['armes.js', 'DOTATION_CHASSEUR'], ['armes.js', 'degatsDe(fiche, distance, zone)'],
  ['armes.js', 'Arsenal', ['constructor(acteur, dotation, modificateurs = null)', 'pas(dt, cmd, partie)', 'prendreRecul(out)', 'ajouterChargeur()', 'get arme', 'get emplacement',
    'get chargeur', 'get reserve', 'get etatArme', 'get tEtat', 'get visee', 'get dispersion', 'get reculV', 'get reculH', 'get tirSeq', 'get letales', 'get tactiques',
    'remplir()', 'ramasser(idArme)', 'etat()', 'appliquer(e)']],
  ['balistique.js', 'Balistique', ['constructor(collisions)', 'vue(ax, ay, az, bx, by, bz)', 'balle(ax, ay, az, dx, dy, dz, portee, out)',
    'tirer(partie, tireur, ox, oy, oz, dx, dy, dz, portee, out)']], ['balistique.js', 'EXCEPTIONS_PREFILTRE'],
  ['touches.js', 'ZONES'], ['touches.js', 'capsules(acteur, out)'], ['touches.js', 'rayonActeurs(acteurs, ox, oy, oz, dx, dy, dz, tMax, sauf, out)'],
  ['grenade.js', 'Grenades', ['constructor(partie)', 'lancer(acteur, type, mecheRestante)', 'pas(dt)', 'get liste', 'etat()', 'appliquer(e)']],
  ['mouvement.js', 'ALLURES'], ['mouvement.js', 'appliquerCommande(acteur, cmd, dt, partie)'], ['mouvement.js', 'hauteurOeil(acteur)'], ['mouvement.js', 'vitesseSaut(acteur)'],
  ['mouvement.js', 'separer(acteurs, collisions)'], ['mouvement.js', 'franchissable(collisions, x, y, z, dx, dz)'],
  ['entrees_jeu.js', 'lireCommande(input, game, cmd, profil, partie)'],
  ['vue_fps.js', 'VueFPS', ['constructor(game)', 'entrer(acteur)', 'sortir()', 'poser(dt, poser = false)', 'impulsion(dTangage, dLacet)', 'secousse(amp, dur)', 'mort(tueurId)',
    'etatArme()', 'get champV', 'capturer()']],
  ['camera_orbite.js', 'CameraOrbite', ['constructor(game)', 'viser(cible, { distance = 2.4, hauteur = 1.2, tangage: [lo, hi] })', 'poser(dt, poser = false)']],
  ['modeles_armes.js', 'MATERIAUX_ARMES'], ['modeles_armes.js', 'REPERES'], ['modeles_armes.js', 'creerArme(id, { pourVue = false } = {})'],
  ['viewmodel.js', 'Viewmodel', ['constructor(game)', 'preparer(progres)', 'get superposition', 'montrer(idArme)', 'cacher()', 'maj(dt, etat)', 'vitrine(idArme)']],
  ['anim_vue.js', 'POSES_VUE'], ['anim_vue.js', 'CHRONOS'], ['anim_vue.js', 'evaluer(piste, t, out)'],
  ['avatars.js', 'FICHES_BOTS'], ['avatars.js', 'preparerAvatars(game, ids, progres)'], ['avatars.js', 'creerCorps(fiche, scene, { equipe })'], ['avatars.js', 'libererCorps(player)'],
  ['teintes.js', 'teinteEquipe(player, equipe)'], ['pose_arme.js', 'poserArme(acteur, dt)'], ['pose_arme.js', 'armeTroisieme(acteur)'], ['accroupi.js', 'accroupir(player, k, bas = 0.42)'],
  ['poupee.js', 'Poupee', ['constructor(player, impulsion, point, collisions)', 'pas(dt)', 'poser()', 'get calme']],
  ['cadence_acteurs.js', 'CadenceActeurs', ['maj(acteurs, camera, imageN)']],
  ['nav.js', 'BORNES_NAV'], ['nav.js', 'VERSION_NAV'],
  ['nav.js', 'Nav', ['static obtenir(game, { pas = 0.25, rayon = 0.3, franchir = true, bornes = BORNES_NAV, progres })', 'restreindre(masque)', 'noeudPres(x, y, z, rayonMax = 1.5)',
    'chemin(de, a, out)', 'demander(cle, de, a, rappel)', 'pasFile()', 'champDepuis(id)', 'aleatoireDans(zoneId, rng)', 'couverts(x, y, z, menaces, rng, n)', 'distancePied(a, b)']],
  ['nav_cache.js', 'lireNav(cle)'], ['nav_cache.js', 'ecrireNav(cle, donnees)'],
  ['pilotage.js', 'Pilote', ['constructor(acteur, nav, balistique)', 'allerA(x, y, z, { sprint, arret = 0.3, marge = 0.3 })', 'stop()', 'pas(dt, cmd)', 'get arrive', 'get coince']],
  ['pilotage.js', 'Errant', ['constructor(acteur, partie, { vers } = {})', 'commande(dt, cmd)']],
  ['apparitions.js', 'POINTS_APPARITION'], ['apparitions.js', 'departs(zoneJeu, equipe, n, rng)'], ['apparitions.js', 'choisirApparition(partie, acteur)'],
  ['apparitions.js', 'ramenerPoint(nav, x, y, z, { rayonMax = 3, degageMin = 1.5 })'],
  ['cerveau.js', 'DIFFICULTES'], ['cerveau.js', 'CerveauBase', ['constructor(acteur, partie, diff)', 'commande(dt, cmd)', 'percevoir()', 'penser()', 'viserVers(x, y, z, dt)',
    'allerA(x, y, z, opts)', 'entendre(evt)', 'get etat']], ['cerveau.js', 'Cerveau', ['commande(dt, cmd)']],
  ['partie_fps.js', 'PartieFPS', ['regles(dt)']],
  ['partie_stand.js', 'PartieStand', ['regles(dt)']], ['partie_stand.js', 'STAND'],
  ['../registre_meubles.js', 'MEUBLES'], ['../registre_meubles.js', 'fermerRegistre(racine)'], ['../registre_meubles.js', 'rattraperRegistre(scene)'],
  ['../registre_meubles.js', 'zonerRegistre(lumieres)'], ['../registre_meubles.js', 'copieMeuble(cle)'],
  ['deguisements.js', 'preparerCatalogue(game, progres)'], ['deguisements.js', 'typesDeguisables(zoneJeu)'], ['deguisements.js', 'viserMeuble(partie, acteur, lacet, tangage)'],
  ['deguisements.js', 'deguiser(partie, acteur, cle)'], ['deguisements.js', 'retirerProp(partie, acteur)'], ['deguisements.js', 'majProps(partie, dt)'],
  ['deguisements.js', 'credibilite(cle, x, y, z, cap, zone, { contreMur = false } = {})'], ['deguisements.js', 'pasRangee(pose)'], ['deguisements.js', 'distPassage(x, y, z)'],
  ['deguisements.js', 'cachettes(zoneJeu, navProps)'], ['deguisements.js', 'candidatsMeubles(partie, x, y, z, rayon, out)'],
  ['deguisements.js', 'toucherPoses(ox, oy, oz, dx, dy, dz, tMax)'],
  ['corps_prop.js', 'CorpsProp', ['constructor(collisions, { rayon, haut, bas, bounds })', 'memoriser()', 'presenter(a)', 'bouger(dir, vitesse, dt)', 'sauter(v)', 'plaquer(collisions)', 'dispose()']],
  ['corps_prop.js', 'deplacerProp(acteur, cmd, dt, partie)'],
  ['partie_prop.js', 'REGLAGES_PROP'], ['partie_prop.js', 'PartieProp', ['static prerequis', 'regles(dt)', 'resoudreTir(tireur, fiche, ox, oy, oz, dx, dy, dz, res, plomb)',
    'appliquerEffet(e)', 'roueOuverte()', 'mouvementSouris(dx, dy)', 'mouvementStick(x, y)', 'lireExtra(input, game, cmd)', 'majHud()', 'get profil', 'bornesTangage()', 'camera(dt, poser)']],
  ['sons_prop.js', 'PROVOCATIONS'], ['sons_prop.js', 'SonsProp', ['constructor(sonsJeu)', 'brancher(partie)', 'debrancher()']],
  ['cerveau_prop.js', 'DIFFICULTES_PROP'], ['cerveau_prop.js', 'CerveauChasseur', ['commande(dt, cmd)', 'viserVers(x, y, z, dt)', 'allerA(x, y, z, opts)', 'entendre(evt)']],
  ['cerveau_prop.js', 'CerveauCacheur', ['constructor(acteur, partie, diff)', 'commande(dt, cmd)', 'entendre(evt)']],
  ['hud_jeu.js', 'HudJeu', ['constructor(game)', 'brancher(partie)', 'debrancher()', 'maj(dt, hud)', '?preparer()']],
  ['hud_prop.js', 'HudProp', ['constructor(game)', 'brancher(partie)', 'debrancher()', 'maj(dt, hud)', '?preparer()']],
  ['hud_prop.js', 'RoueProvocations', ['constructor(parent)', 'maj(roue, provocations)']],
  ['tableau_scores.js', 'TableauScores', ['constructor(game)', 'maj(partie, montre)']],
  ['minicarte.js', 'MiniCarte', ['constructor(game)', 'preparer(nav)', 'maj(dt, partie)']],
  ['menus_jeu.js', 'MenuJeu', ['constructor(game, deps)', 'accueil()', 'reglage(mode)', 'preparation(f, etape)', 'fin(resultat)', 'credits()', 'camera(dt, poser)']],
  ['portraits.js', 'portrait(fiche)'],
  ['effets.js', 'Effets', ['constructor(game)', 'brancher(partie)', 'debrancher()', 'maj(dt)', '?preparer(progres)']],
  ['sons_jeu.js', 'SonsJeu', ['constructor(audio)', 'brancher(partie)', 'debrancher()', 'maj(dt, camera)',
    'jouer3d(x, y, z, recette, { gain = 1, rayon = 30, bas = false, prioritaire = false })', 'get voix', '?preparer()']],
  ['assistance_visee.js', 'corriger(cmd, game, dt)'], ['assistance_visee.js', 'facteurStick(game)'],
  ['monde_partie.js', 'TABLE_PORTES_FPS'], ['monde_partie.js', 'TABLE_PORTES_PROP'], ['monde_partie.js', 'TABLE_DEPOLIS'], ['monde_partie.js', 'regleParDefaut(porte, zoneJeu, mode)'],
  ['monde_partie.js', 'MondePartie', ['constructor(game)', 'preparerSession()', 'entrer(zoneJeu, table)', 'sortir()', 'majPortes(dt, acteurs)', 'verrouiller(nom, ferme)',
    'noeudsAutorises(nav, zoneJeu, mode)', 'image(dt)', 'etat()', 'appliquer(e)']],
  ['profil.js', 'PROFIL_CLE'], ['profil.js', 'Profil', ['charger()', 'enregistrer()', 'brancher(partie)', 'debrancher()', 'get niveau', 'get xp', 'modificateurs(classe)']],
  ['killcam.js', 'Killcam', ['constructor(game)', 'brancher(partie)', 'debrancher()', 'enregistrer(partie)', 'get pret', 'rejouer(victimeId)']],
  ['aff_progression.js', 'AffProgression', ['constructor(game)', 'brancher(partie)', 'debrancher()', 'maj(dt)']],
];
// le nombre de paramètres comme Function.length : jusqu'au premier qui a une valeur par défaut (au niveau 0) ou au reste
function arite(sig) {
  const i = sig.indexOf('('); if (i < 0) return null;
  let d = 0, j = i + 1, cur = '', params = [];
  for (; j < sig.length; j++) {
    const ch = sig[j];
    if (ch === '(' || ch === '{' || ch === '[') d++;
    if (ch === ')' || ch === '}' || ch === ']') { if (d === 0) break; d--; }
    if (ch === ',' && d === 0) { params.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) params.push(cur.trim());
  let n = 0;
  for (const p of params) {
    if (p.startsWith('...')) break;
    let dd = 0, defaut = false;
    for (const ch of p) { if ('({['.includes(ch)) dd++; else if (')}]'.includes(ch)) dd--; else if (ch === '=' && dd === 0) { defaut = true; break; } }
    if (defaut) break;
    n++;
  }
  return n;
}
// un membre d'une classe : sur le prototype (ou la classe pour `static`), en remontant la chaîne
function membre(C, nom, statique) {
  let o = statique ? C : C.prototype;
  while (o) { const d = Object.getOwnPropertyDescriptor(o, nom); if (d) return d; o = Object.getPrototypeOf(o); }
  return null;
}

export default function (jeu) {
  const game = window.__game;
  const T = (nom, fn, opts) => jeu.ajouterTest('S0', nom, fn, opts);
  const profil = () => (window.__chargement && window.__chargement.telephone ? 'tel' : 'pc');
  // deux points libres de la rue (bornée en partie : z ≤ 6) à `d` m l'un de l'autre, qui se voient (œil → buste, dans les
  // deux sens)
  const ligneLibre = (p, d = 10) => {
    const C = game.collisions;
    for (const z of [4.5, 3.5, 5.5, 2.5, 5.0, 4.0]) for (const x0 of [2, 4, 6, 8, 10, 0]) {
      const a = { x: x0, z }, b = { x: x0 + d, z };
      a.y = C.solEn(a.x, a.z, 0.3); b.y = C.solEn(b.x, b.z, 0.3);
      if (!C.libre(a.x, a.z, 0.35, a.y) || !C.libre(b.x, b.z, 0.35, b.y)) continue;
      if (p.balistique.vue(a.x, a.y + 1.62, a.z, b.x, b.y + 1.27, b.z) && p.balistique.vue(b.x, b.y + 1.62, b.z, a.x, a.y + 1.27, a.z)) return [a, b];
    }
    return null;
  };

  // 1. LA BALADE AU BIT PRÈS (vue 3 et vue 1 ; deux rejeux identiques ; Math.random et performance.now rendus)
  T('1 balade rejouée au bit près', async () => {
    const r = await jeu.rejouerBalade();
    return { ok: r.ok && r.identiques && r.fonctionsRendues, attendu: `écart ≤ ${r.seuils.pos} (positions) / ${r.seuils.cam} (caméra), deux rejeux identiques, fonctions rendues`,
      obtenu: `profil ${r.profil} · vue 3 ${r.vue3.pos} / ${r.vue3.cam} · vue 1 ${r.vue1.pos} / ${r.vue1.cam} · même onglet ${r.identiques} · rendues ${r.fonctionsRendues}` };
  }, { delai: 120 });

  // 2. LES 346 SIÈGES
  T('2 sièges : 346, empreinte, tous assis', async () => {
    const ref = jeu.reference;
    const emp = window.__rejeuBalade.empreinteSieges(game.siegesTous);
    const v = await jeu.verifierSieges();
    const ok = game.siegesTous.length === 346 && emp === ref.sieges.empreinte && v.assis === 346 && v.refus.length === 0;
    return { ok, attendu: '346 · ' + ref.sieges.empreinte + ' · 346 assis, 0 refus', obtenu: `${game.siegesTous.length} · ${emp} · ${v.assis} assis sur ${v.total}, refus [${v.refus.slice(0, 12)}] · ${Math.round(v.ms)} ms` };
  }, { delai: 600 });

  // 3. L'ASCENSEUR
  T('3 ascenseur : appel, montée au 2e, descente', async () => {
    const r = jeu.verifierAscenseur();
    return { ok: r.appel && r.montee && r.descente, attendu: 'appel, montée, descente', obtenu: JSON.stringify(r) };
  });

  // 4. LA CONSTRUCTION INCHANGÉE : la ligne [optim], les lumières
  T('4 [optim] et lumières = référence', async () => {
    const R = jeu.reference[profil()], l = window.__rejeuBalade.lumieres(game.scene);
    return { ok: jeu.releve.optim === R.optim && l === R.lumieres, attendu: `${R.optim} · ${R.lumieres} lumières`, obtenu: `${jeu.releve.optim} · ${l} lumières` };
  });

  // 5. LES ENTRÉES, en balade et en essai
  T('5 entrées : balade et essai à 0', async () => {
    const a = await jeu.verifierEntrees();
    await jeu.lancer('essai', { graine: 5, mannequins: 3 });
    await jeu.images(3);
    const b = await jeu.verifierEntrees();
    jeu.quitter('balade');
    const zero = (r) => Object.values(r).every((v) => v === 0);
    return { ok: zero(a) && zero(b), attendu: 'tout à 0', obtenu: 'balade ' + JSON.stringify(a) + ' · essai ' + JSON.stringify(b) };
  });

  // 6. LA CONVENTION DE LA CAMÉRA (arbitrage 2)
  T('6 convention : VueFPS = formule, azimut de la vue 1', async () => {
    const R = new Rng(1), C = [];
    for (let i = 0; i < 200; i++) C.push([R.range(-Math.PI, Math.PI), R.range(-1.4, 1.4)]);
    await jeu.lancer('essai', { graine: 1, mannequins: [] });
    const p = game.partie, cam = game.camera, d = new THREE.Vector3(), f = new THREE.Vector3();
    let maxF = 0;
    for (const [l, t] of C) {
      game.camYaw = l; game.camPitch = t; p.camera(0, true); cam.getWorldDirection(d);
      f.set(-Math.sin(l) * Math.cos(t), -Math.sin(t), -Math.cos(l) * Math.cos(t));
      maxF = Math.max(maxF, d.angleTo(f) / DEG);
    }
    jeu.quitter('balade');
    const vue = game.vue; let maxAz = 0, signes = 0;
    game.vue = 1;
    try {
      for (const [l, t] of C) {
        game.camYaw = l; game.camPitch = t; game.updateCamera(0, true); cam.getWorldDirection(d);
        const az = Math.atan2(d.x, d.z), azF = Math.atan2(-Math.sin(l), -Math.cos(l));
        maxAz = Math.max(maxAz, Math.abs(Math.atan2(Math.sin(az - azF), Math.cos(az - azF))) / DEG);
        if (Math.abs(t) > 1e-3 && Math.sign(d.y) === Math.sign(-Math.sin(t))) signes++;
        else if (Math.abs(t) <= 1e-3) signes++;
      }
    } finally { game.vue = vue; game.placerAuDepart(); }
    return { ok: maxF <= 0.1 && maxAz <= 0.1 && signes === 200, attendu: '≤ 0,1° · azimut ≤ 0,1° · 200 signes', obtenu: `${maxF.toExponential(2)}° · ${maxAz.toExponential(2)}° · ${signes} signes` };
  });

  // 7. UNE PARTIE D'ESSAI : l'entrée, l'œil, le tir, la sortie
  T('7 essai : entrée, œil, tir, élimination, sortie', async (t) => {
    jeu.quitter('balade');
    for (let i = 0; i < 120; i++) game.carte.maj(1 / 60, game);
    const avant = jeu.instantane(), fixesAvant = enfantsFixes(game);
    const t0 = performance.now();
    await jeu.lancer('essai', { graine: 42, mannequins: 3 });
    const msEntree = performance.now() - t0;
    await jeu.images(2);
    const p = game.partie, a = p.local, oeil = game.camera.position.y - a.pos.y;
    // le mannequin VU de l'œil de Haythem
    const o = a.oeil(new THREE.Vector3());
    const m = p.acteurs.find((b) => b.id > 0 && p.balistique.vue(o.x, o.y, o.z, b.pos.x, b.pos.y + 1.27, b.pos.z));
    const ev = { tir: 0, touche: 0, elim: 0, vie0: null };
    const des = p.sur('*', (e) => { if (e.type === 'tir' && e.a === 0) ev.tir++; if (e.type === 'touche' && m && e.cible === m.id) ev.touche++; if (e.type === 'elim' && m && e.cible === m.id) { ev.elim++; ev.vie0 = m.vie; } });
    if (m) jeu.viser(0, m.id);
    jeu.commande(0, { tir: true }, 1);
    jeu.avancer(1.2);
    des();
    jeu.quitter('balade');
    for (let i = 0; i < 120; i++) game.carte.maj(1 / 60, game);
    const apres = jeu.instantane(), ref = jeu.reference[profil()].instantane;
    const okT = t.temps('entrée en essai (ms)', msEntree, 2000);
    const ok = okT && !!m && Math.abs(oeil - 1.62) <= 0.01 && ev.tir >= 10 && ev.touche >= 1 && ev.elim === 1 && ev.vie0 === 0 && game.partie === null
      && apres.profil === 'balade' && !apres.sourisJeu && egal(sansEnfants(apres), sansEnfants(ref)) && egal(sansEnfants(apres), sansEnfants(avant)) && enfantsFixes(game) === fixesAvant;
    return { ok, attendu: 'entrée ≤ 2 s, œil 1,62 ± 0,01, ≥ 10 tirs, ≥ 1 touche, 1 élimination à 0 PV, sortie : partie nulle, profil balade, instantané = référence (hors enfants : avant/après)',
      obtenu: `entrée ${Math.round(msEntree)} ms · mannequin ${m ? m.id : 'aucun vu'} · œil ${r2(oeil)} · ${ev.tir} tirs, ${ev.touche} touches, ${ev.elim} élim. (vie ${ev.vie0}) · partie ${game.partie} · ${apres.profil}/${apres.sourisJeu}`
        + ` · réf. ${egal(sansEnfants(apres), sansEnfants(ref))} · avant/après ${egal(sansEnfants(apres), sansEnfants(avant))} · enfants fixes ${enfantsFixes(game)}/${fixesAvant}`
        + ` (avec les « suites » du décor coupé, créées à la demande par ce que la caméra a vu : ${apres.enfants}/${avant.enfants})` };
  });

  // 8. TROIS CYCLES lancer / quitter ; programmes constants pendant 10 s de tir
  T('8 trois cycles : mémoire, enfants, instantané ; programmes constants', async (t) => {
    // (un cycle : les corps libérés attendus — Player.dispose attend que leurs programmes en compilation soient prêts)
    const cycle = async () => {
      await jeu.lancer('essai', { graine: 8, mannequins: 3, bots: 2 }); await jeu.images(20);
      const B = game.partie.acteurs.map((a) => a.joueur).filter((j) => j && j !== game.user);
      jeu.quitter('balade'); await Promise.all(B.map((j) => j.liberation));
      for (let i = 0; i < 120; i++) game.carte.maj(1 / 60, game);
      await jeu.images(2);
    };
    // (d'abord, les préchauffes du décor qui restent — js/game.js PRECHAUFFE, à 1,5 … 22 s de temps de JEU : dans un onglet
    // frais où les tests font peu d'images, elles tombaient en plein milieu des cycles et envoyaient ≈ 100 géométries du décor
    // à la carte graphique ; puis deux cycles : l'affichage partagé créé, les suites du décor vues)
    for (let k = game._chaudN || 0; k < 5; k++) { game._chaudN = k + 1; game.prechaufferScene(); }
    await t.attendre(1.5); await jeu.images(5);
    await cycle(); await cycle();
    // (les « suites » du décor coupé, js/ecole_visibilite.js : une géométrie chacune, créées À LA DEMANDE par ce que la caméra
    // voit pour la première fois — comptées à part, elles ne sont pas une fuite de la partie)
    const suites = () => { let n = 0; game.scene.traverse((o) => { if (o.userData.suite) n++; }); return n; };
    const m0 = jeu.memoire(), i0 = jeu.instantane(), s0 = suites();
    for (let k = 0; k < 3; k++) await cycle();
    const m1 = jeu.memoire(), i1 = jeu.instantane(), s1 = suites();
    m1.geometries -= s1 - s0;
    const pc = (a, b) => Math.abs(a - b) / Math.max(1, a);
    // programmes pendant 10 s de tir (images réelles, ou faites à la main sans rAF)
    await jeu.lancer('essai', { graine: 9, mannequins: 3 });
    await jeu.images(10);
    const p0 = game.renderer.info.programs.length;
    jeu.commande(0, { tir: true }, 10);
    const tir0 = jeu.compteurs().tirs;
    const t0 = performance.now();
    while (performance.now() - t0 < 10000) await jeu.images(10);
    const p1 = game.renderer.info.programs.length, tirs = jeu.compteurs().tirs - tir0;
    jeu.quitter('balade');
    const ok = pc(m0.geometries, m1.geometries) <= 0.02 && pc(m0.textures, m1.textures) <= 0.02 && m0.enfants === m1.enfants && egal(i0, i1) && p0 === p1 && tirs > 20;
    return { ok, attendu: 'géométries et textures ± 2 %, enfants identiques, instantané identique, programmes constants pendant 10 s de tir',
      obtenu: `géo ${m0.geometries}→${m1.geometries} (hors ${s1 - s0} suites neuves du décor) · tex ${m0.textures}→${m1.textures} · enfants ${m0.enfants}→${m1.enfants} · instantané ${egal(i0, i1)} · programmes ${p0}→${p1} (${tirs} tirs)` };
  }, { delai: 240 });

  // 9. L'ÉTAT ET LE DÉTERMINISME
  T('9 verifierEtat, verifierDeterminisme(42, 30)', async () => {
    const e = await jeu.verifierEtat();
    const d = await jeu.verifierDeterminisme(42, 30);
    return { ok: e && d.egal, attendu: 'état vrai · déterminisme égal', obtenu: `état ${e} · ${d.a} / ${d.b}` };
  }, { delai: 240 });

  // 10. LE COÛT DE Partie.pas (1 + 3 mannequins + 2 bots)
  T('10 Partie.pas ≤ 0,2 ms (essai 1 + 3 + 2)', async (t) => {
    await jeu.lancer('essai', { graine: 10, mannequins: 3, bots: 2 });
    jeu.avancer(1);
    const r = jeu.avancer(10);
    jeu.quitter('balade');
    const ms = r.ms / r.pas;
    return { ok: t.temps('Partie.pas moyen (ms)', ms, 0.2), attendu: '≤ 0,2 ms', obtenu: ms.toFixed(4) + ' ms sur ' + r.pas + ' pas' };
  }, { delai: 120 });

  // 11. LES SIGNATURES (introspection) : 0 manquant
  T('11 signatures du § 4.5 : 0 manquant', async () => {
    const manques = [], vus = new Set();
    for (const [f, nom, membres] of SIGNATURES) {
      let M;
      try { M = await import(f.startsWith('../') ? '../' + f : '../' + f); } catch (e) { manques.push(f + ' : import ' + e.message); continue; }
      vus.add(f);
      const n = nom.indexOf('(') >= 0 ? nom.slice(0, nom.indexOf('(')).replace(/^\.\.\./, '') : nom;
      const X = M[n];
      if (X === undefined) { manques.push(`${f} ${n}`); continue; }
      if (nom.includes('(')) {
        if (typeof X !== 'function') { manques.push(`${f} ${n} n'est pas une fonction`); continue; }
        const a = arite(nom);
        if (X.length !== a) manques.push(`${f} ${n} : ${X.length} paramètre(s), ${a} attendu(s)`);
      }
      for (const s of membres || []) {
        const fac = s.startsWith('?'), sig = fac ? s.slice(1) : s;
        if (sig.startsWith('constructor(')) { const a = arite(sig); if (X.length !== a) manques.push(`${f} ${n} constructeur : ${X.length}, ${a} attendu(s)`); continue; }
        if (sig.startsWith('get ') || sig.startsWith('set ')) {
          const d = membre(X, sig.slice(4), false);
          if (!d || !(sig.startsWith('get') ? d.get : d.set)) manques.push(`${f} ${n}.${sig}`);
          continue;
        }
        const statique = sig.startsWith('static ');
        const s2 = statique ? sig.slice(7) : sig, mn = s2.includes('(') ? s2.slice(0, s2.indexOf('(')) : s2;
        const d = membre(X, mn, statique);
        if (!d) { if (!fac) manques.push(`${f} ${n}.${mn}`); continue; }
        if (s2.includes('(')) {
          if (typeof d.value !== 'function') { manques.push(`${f} ${n}.${mn} n'est pas une méthode`); continue; }
          const a = arite(s2);
          if (d.value.length !== a) manques.push(`${f} ${n}.${mn} : ${d.value.length} paramètre(s), ${a} attendu(s)`);
        }
      }
    }
    // (et le harnais : l'API du § 4.10)
    for (const k of ['pret', 'lancer', 'quitter', 'etat', 'empreinte', 'acteurs', 'teleporter', 'teleporterZone', 'viser', 'commande', 'tirer', 'avancer', 'images',
      'compteurs', 'verifierNav', 'verifierBots', 'verifierDeterminisme', 'verifierEtat', 'verifierEntrees', 'simulerCapture', 'forcerImagesManuelles', 'verifierMeubles',
      'rejouerBalade', 'memoire', 'photo', 'mesurer', 'qualite', 'figerQualite', 'ajouterTest', 'tests', 'verifierSieges', 'verifierAscenseur', 'instantane', 'verifierRaf', 'oublierCache'])
      if (typeof jeu[k] !== 'function') manques.push('__jeu.' + k);
    if (!jeu.journalAudio || typeof jeu.journalAudio.vider !== 'function') manques.push('__jeu.journalAudio');
    return { ok: manques.length === 0, attendu: '0 manquant', obtenu: manques.length ? manques.join(' ; ') : `0 manquant (${SIGNATURES.length} exports, ${vus.size} modules)` };
  });

  // 12. LE DÉMARRAGE (selon l'adresse : sans partie= → le menu, partie=balade → la balade, partie=essai → la partie)
  T('12 démarrage selon l’adresse', async () => {
    const D = jeu.demarrage || {}, P = new URLSearchParams(location.search).get('partie');
    let ok, attendu;
    if (!P) { ok = D.mode === 'menu' && D.menu && D.focus === 'balade'; attendu = 'mode menu, #menu-jeu visible, focus manette sur BALADE LIBRE'; }
    else if (P === 'balade') { ok = D.mode === 'lobby' && !D.partie; attendu = 'mode lobby, partie nulle'; }
    else { ok = D.partie === P || (P === 'essai' && D.partie === 'essai'); attendu = 'en partie ' + P; }
    return { ok, attendu, obtenu: JSON.stringify(D) };
  });

  // 13. LA PAUSE ET LA REPRISE ; LE CALQUE « CLIQUE POUR JOUER »
  T('13 pause, reprise, calque', async () => {
    const res = [];
    await jeu.lancer('essai', { graine: 13, mannequins: 3 });
    await jeu.images(2);
    const p = game.partie;
    jeu.simulerCapture('refusee');
    // (a) la capture perdue → pause dans la même image
    document.dispatchEvent(new CustomEvent('iris-pointeur', { detail: { capture: false } }));
    res.push(['pause', game.paused === true && !document.getElementById('overlay').hidden]);
    // (b) « Reprendre » au clavier-souris : entrée purgée, capture redemandée, refusée → calque, partie gelée
    game.input.pressedSet.add('Space');
    game.togglePause(true);
    await new Promise((r) => setTimeout(r, 30));
    const calque = document.getElementById('calque-clic');
    res.push(['purgée', !game.input.pressedSet.has('Space')]);
    res.push(['calque', !calque.hidden && game.paused && document.getElementById('overlay').hidden]);
    const t0 = p.t; await jeu.images(10);
    res.push(['gelée', p.t === t0]);
    // le clic sur le calque, capture accordée : la partie repart
    jeu.simulerCapture('accordee');
    calque.click(); await new Promise((r) => setTimeout(r, 30));
    await jeu.images(5);
    res.push(['repart au clic', calque.hidden && !game.paused && p.t > t0]);
    // (c) à la manette : reprise SANS capture
    jeu.simulerCapture('refusee');
    entree.manette = true;
    try {
      game.togglePause(); const t1 = p.t; game.togglePause();
      await jeu.images(5);
      res.push(['manette', !game.paused && calque.hidden && p.t > t1]);
    } finally { entree.manette = false; }
    jeu.quitter('balade');
    // (d) présentation → décompte : clavier-souris sans capture → calque, décompte gelé ; manette → décompte direct
    jeu.simulerCapture('refusee');
    await jeu.lancer('equipes', { graine: 13, zone: 'ss', allies: 0, ennemis: 1 });
    const q = game.partie;
    for (let i = 0; i < 400 && q.phase === 'presentation'; i++) game.frame(1 / 60);
    game.frame(1 / 60);
    const t2 = q.t; await jeu.images(10);
    res.push(['décompte gelé', q.phase === 'decompte' && !calque.hidden && game.paused && q.t === t2]);
    jeu.quitter('balade');
    entree.manette = true;
    try {
      await jeu.lancer('equipes', { graine: 13, zone: 'ss', allies: 0, ennemis: 1 });
      const s = game.partie;
      for (let i = 0; i < 400 && s.phase === 'presentation'; i++) game.frame(1 / 60);
      game.frame(1 / 60);
      const t3 = s.t; game.frame(1 / 60); game.frame(1 / 60);
      res.push(['décompte direct (manette)', s.phase === 'decompte' && calque.hidden && !game.paused && s.t > t3]);
    } finally { entree.manette = false; jeu.simulerCapture(null); jeu.quitter('balade'); }
    const ko = res.filter((r) => !r[1]).map((r) => r[0]);
    return { ok: ko.length === 0, attendu: res.map((r) => r[0]).join(', '), obtenu: ko.length ? 'faux : ' + ko.join(', ') : 'tout vrai' };
  });

  // 14. LA PASSE SUPERPOSÉE
  T('14 passe superposée : balade éteinte, essai active (composer, léger, sans composer)', async () => {
    const fx = game.fx;
    jeu.quitter('balade'); await jeu.images(2);
    const balade = fx.superpositions.length === 0 && fx.passeSuperposee.enabled === false;
    await jeu.lancer('essai', { graine: 14, mannequins: 3 }); await jeu.images(2);
    const vm = game.partie.aff.viewmodel;
    const r = game.renderer, rendre = r.render; let vus = 0;
    r.render = function (s, c) { if (s === vm.scene) vus++; return rendre.call(this, s, c); };
    let composer = 0, sans = 0, ordre = false;
    try {
      game.frame(1 / 60); composer = vus;
      const i = fx.composer.passes.indexOf(fx.passeSuperposee);
      ordre = i === fx.composer.passes.indexOf(fx.oeil) + 1;
      vus = 0; const en = fx.enabled; fx.enabled = false;
      try { game.frame(1 / 60); sans = vus; } finally { fx.enabled = en; }
    } finally { r.render = rendre; }
    const essai = fx.superpositions.length === 1 && fx.passeSuperposee.enabled === true;
    jeu.quitter('balade'); await jeu.images(2);
    const apres = fx.superpositions.length === 0 && fx.passeSuperposee.enabled === false;
    return { ok: balade && essai && composer === 1 && sans === 1 && ordre && apres, attendu: 'balade : éteinte ; essai : 1 superposition, dessinée après l’œil (composer et chemin léger), et sans composer ; sortie : éteinte',
      obtenu: `balade ${balade} · essai ${essai} · composer ${composer} (après l’œil ${ordre}) · sans composer ${sans} · après ${apres} · qualité ${fx.quality}` };
  });

  // 15. LES RÉGLAGES : un iris.settings.v1 de a8b22dd aux touches changées
  T('15 réglages anciens gardés, profils ajoutés', async () => {
    const ancien = { graphics: { quality: 'high' }, audio: { master: 0.4, sfx: 0.9 },
      controls: { sensitivity: 1.2, invertY: false, bindings: { forward: ['KeyI', 'ArrowUp'], back: ['KeyK', null], left: ['KeyJ', null], right: ['KeyL', null], sprint: ['ShiftLeft', null],
        walk: ['AltLeft', null], jump: ['KeyB', 'Space'], interact: ['KeyE', null], emote: ['KeyY', null], camera: ['KeyV', null], phone: ['KeyP', null], pause: ['Escape', null] },
        pad: { bindings: { jump: ['Pad:B', null] }, deadzone: 0.2 } }, game: { vue: 2, emotes: ['danse'] } };
    const s = new settings.constructor();
    s.charger(JSON.parse(JSON.stringify(ancien)));
    const b = s.bindingsDe('balade');
    const garde = Object.keys(ancien.controls.bindings).every((k) => egal(b[k], ancien.controls.bindings[k])) && egal(s.padBindings.jump, ['Pad:B', null]);
    const J = s.data.jeu, F = s.controls.fps;
    const ajoute = !!s.controls.combat && !!s.controls.prop && !!F && F.sens === 0.45 && F.champ === 90 && J && J.habillage === 'airsoft' && J.prop.zone === null
      && egal(s.bindingsDe('combat').tir, ['Souris:0', null]) && egal(s.bindingsDe('prop').provoc3, ['Digit3', null]) && s.data.game.demarrage === 'menu' && s.data.game.vue === 2;
    return { ok: garde && ajoute, attendu: 'touches de balade identiques ; combat, prop, fps, jeu aux défauts (airsoft, zone null)',
      obtenu: `gardées ${garde} · ajoutés ${ajoute} · habillage ${J && J.habillage} · zone ${J && J.prop.zone}` };
  });

  // 16. aucune lumière créée dans js/jeu/ hors viewmodel.js (le reste du point 16 : tools/verifier_proprietaires.py, en ligne de
  // commande ; le motif cherché est fabriqué ici, pour que ce fichier-ci ne le contienne pas)
  const LUMIERE = 'Light' + '(';
  T('16 aucune lumière dans js/jeu/ hors viewmodel.js', async () => {
    const fichiers = ['index', 'constantes', 'rng', 'commande', 'acteur', 'partie', 'partie_essai', 'harnais', 'armes', 'balistique', 'touches', 'grenade', 'mouvement',
      'entrees_jeu', 'vue_fps', 'camera_orbite', 'modeles_armes', 'anim_vue', 'avatars', 'teintes', 'pose_arme', 'accroupi', 'poupee', 'cadence_acteurs', 'nav', 'nav_cache',
      'pilotage', 'apparitions', 'cerveau', 'partie_fps', 'partie_stand', 'deguisements', 'corps_prop', 'partie_prop', 'sons_prop', 'cerveau_prop', 'hud_jeu', 'hud_prop',
      'tableau_scores', 'minicarte', 'menus_jeu', 'portraits', 'effets', 'sons_jeu', 'assistance_visee', 'monde_partie', 'killcam', 'profil', 'aff_progression'];
    const fautes = [];
    for (const f of fichiers) {
      const t = await fetch(new URL('../' + f + '.js', import.meta.url), { cache: 'no-cache' }).then((r) => r.text());
      if (t.includes(LUMIERE)) fautes.push(f);
    }
    const vm = await fetch(new URL('../viewmodel.js', import.meta.url), { cache: 'no-cache' }).then((r) => r.text());
    return { ok: fautes.length === 0 && vm.includes(LUMIERE), attendu: '0 fichier (et les 3 lumières de viewmodel.js)', obtenu: fautes.length ? fautes.join(', ') : `0 sur ${fichiers.length}` };
  });

  // 17. L'AIDE DE LA BALADE, JAMAIS EN PARTIE
  T('17 #hud-hint vide en partie ; body.combat ; aucun hud.feedback', async () => {
    const hint = document.getElementById('hud-hint'), streak = document.getElementById('hud-streak');
    let feedbacks = 0;
    const fb = game.hud.feedback; game.hud.feedback = function (...a) { feedbacks++; return fb.apply(this, a); };
    let vide = true;
    try {
      await jeu.lancer('essai', { graine: 17, mannequins: 3 });
      const t0 = performance.now();
      while (performance.now() - t0 < 10000) { await jeu.images(10); if (hint.textContent.trim()) vide = false; }
      document.dispatchEvent(new CustomEvent('hoops-entree')); await jeu.images(3); if (hint.textContent.trim()) vide = false;
      settings.set('audio.sfx', settings.audio.sfx); await jeu.images(3); if (hint.textContent.trim()) vide = false;
    } finally { game.hud.feedback = fb; }
    const cache = getComputedStyle(hint).display === 'none' && getComputedStyle(streak).display === 'none' && document.body.classList.contains('combat');
    jeu.quitter('balade');
    return { ok: vide && cache && feedbacks === 0, attendu: 'vide pendant 10 s, après hoops-entree et settings.set ; cachés par body.combat ; 0 hud.feedback',
      obtenu: `vide ${vide} · cachés ${cache} · ${feedbacks} feedback(s)` };
  }, { delai: 60 });

  // 18. PAS DE PURGE EN ROUTE ; LA PURGE À L'ENTRÉE ET À LA SORTIE
  T('18 saut + settings.set dans la même image → le saut a lieu ; purge à l’entrée et à la sortie', async () => {
    // (qui appelle appliquerProfil, et avec quoi : l'entrée et la sortie purgent, applySettings jamais)
    const appels = [], ap = game.appliquerProfil;
    game.appliquerProfil = function (o) { appels.push(!!(o && o.purger)); return ap.call(this, o); };
    let purgeEntree, purgeSortie, saute = false, sansPurge;
    try {
      await jeu.lancer('essai', { graine: 18, mannequins: 3 });
      purgeEntree = appels.includes(true);
      const a = game.partie.local;
      for (let i = 0; i < 60; i++) game.frame(1 / 60);
      appels.length = 0;
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
      settings.set('audio.sfx', settings.audio.sfx);
      window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' }));
      sansPurge = appels.length >= 1 && !appels.includes(true);
      for (let i = 0; i < 6 && !saute; i++) { game.frame(1 / 60); if (a.corps.airborne) saute = true; }
      appels.length = 0;
      game.input.presser('Space'); game.input.relacher('Space');
      jeu.quitter('balade');
      purgeSortie = appels.includes(true) && !game.input.pressedSet.has('Space');
    } finally { game.appliquerProfil = ap; }
    return { ok: purgeEntree && sansPurge && saute && purgeSortie, attendu: 'purge à l’entrée ; settings.set sans purge, le saut a lieu ; purge à la sortie',
      obtenu: `entrée ${purgeEntree} · sans purge ${sansPurge} · saut ${saute} · sortie ${purgeSortie}` };
  });
  // 19. DEUX TIRS MORTELS AU MÊME PAS : deux éliminations ; les ids inversés, pareil
  T('19 tirs simultanés : deux éliminations, quel que soit l’ordre', async () => {
    const essai = async (ids) => {
      await jeu.lancer('essai', { graine: 19, mannequins: [], humain: false });
      const p = game.partie, L = ligneLibre(p, 10);
      if (!L) { jeu.quitter('balade'); return { elims: -1, memePas: false, vus: false }; }
      const A = p.ajouterActeur({ id: ids[0], nom: 'A', equipe: 'A', x: L[0].x, y: L[0].y, z: L[0].z, lacet: -Math.PI / 2, classe: 'assaut' });
      const B = p.ajouterActeur({ id: ids[1], nom: 'B', equipe: 'B', x: L[1].x, y: L[1].y, z: L[1].z, lacet: Math.PI / 2, classe: 'assaut' });
      const vue = (P, Q) => p.balistique.vue(P.pos.x, P.pos.y + 1.62, P.pos.z, Q.pos.x, Q.pos.y + 1.27, Q.pos.z);
      A.vie = 1; B.vie = 1; A.protegeT = 0; B.protegeT = 0;
      jeu.viser(ids[0], ids[1]); jeu.viser(ids[1], ids[0]);
      jeu.avancer(PAS * 2);
      const tick = []; const des = p.sur('elim', (e) => tick.push(p.tick));
      jeu.commande(ids[0], { tir: true }, PAS * 3); jeu.commande(ids[1], { tir: true }, PAS * 3);
      jeu.avancer(PAS * 3);
      des();
      const r = { elims: tick.length, memePas: tick.length === 2 && tick[0] === tick[1], vus: vue(A, B) };
      jeu.quitter('balade');
      return r;
    };
    const a = await essai([1, 2]), b = await essai([2, 1]);
    return { ok: a.elims === 2 && a.memePas && b.elims === 2 && b.memePas, attendu: '2 éliminations au même pas, dans les deux ordres', obtenu: JSON.stringify({ a, b }) };
  });

  // 20. LE HARNAIS SANS rAF
  T('20 images sans rAF, photo', async (t) => {
    const raf = await jeu.verifierRaf();
    t.note('rAF par seconde', raf.rafParSeconde);
    jeu.forcerImagesManuelles(true);
    let r;
    const t0 = performance.now();
    try { r = await jeu.images(10); } finally { jeu.forcerImagesManuelles(false); }
    const ms = performance.now() - t0, ph = jeu.photo('test');
    return { ok: ms < 5000 && r.valable === false && r.appels > 0 && r.n === 10 && typeof ph === 'string' && ph.length > 5000,
      attendu: '< 5 s, valable faux, appels comptés, photo non vide', obtenu: `${Math.round(ms)} ms · valable ${r.valable} · ${r.appels} appels · photo ${ph.length} car. · rAF ${raf.rafParSeconde}/s (caché ${raf.cache})` };
  });

  // 21. LE SON SOUS ?test=1
  T('21 son hors ligne : programmé, libéré sur l’horloge de SonsJeu', async () => {
    const hl = game.audio.ctx instanceof OfflineAudioContext;
    await jeu.lancer('essai', { graine: 21, mannequins: [] });
    const S = game.partie.aff.sons, J = jeu.journalAudio; J.vider();
    let fini = 0;
    const v = S.jouer3d(0, 0, 0, (ctx, sortie, quand) => { const o = ctx.createOscillator(); o.onended = () => { fini++; }; o.connect(sortie); o.start(quand); o.stop(quand + 0.3); return 0.3; }, { gain: 0.1 });
    const debut = J.entrees.find((e) => e.methode === 'start');
    const q0 = game.audio.ctx.currentTime;
    jeu.avancer(0.29); const actif = S.voix.includes(v);
    jeu.avancer(0.02); const libre = !S.voix.includes(v);
    jeu.quitter('balade');
    return { ok: hl && !!v && !!debut && Math.abs(debut.quand - q0) < 1e-9 && actif && libre && fini === 0,
      attendu: 'OfflineAudioContext, start au journal à la date programmée, active à 0,29 s, libérée à 0,31 s, sans onended',
      obtenu: `hors ligne ${hl} · start ${debut ? debut.quand : 'absent'} · active ${actif} · libérée ${libre} · onended ${fini}` };
  });

  // 22. Player.dispose : tout libéré, bonhomme de secours compris
  T('22 Player.dispose : 20 corps, compte exact', async () => {
    const P = [];
    const enfants = game.scene.children.length;
    for (let i = 0; i < 20; i++) P.push(creerCorps(FICHE_HAYTHEM, game.scene, {}));
    const t0 = performance.now();
    while (performance.now() - t0 < 15000 && P.some((p) => !p.avatarModel)) await new Promise((r) => setTimeout(r, 100));
    await Promise.all(P.map((p) => p._pretAvatar).filter(Boolean));
    const attG = new Set(), attM = new Set();
    for (const p of P) {
      p.body.traverse((o) => { if (o.isMesh) { attG.add(o.geometry); attM.add(o.material); } });
      if (p.avatarModel) p.avatarModel.traverse((o) => { if (o.isMesh && o.material) attM.add(o.material); });
    }
    const vusG = new Set(), vusM = new Set();
    const dG = THREE.BufferGeometry.prototype.dispose, dM = THREE.Material.prototype.dispose;
    THREE.BufferGeometry.prototype.dispose = function () { vusG.add(this); return dG.call(this); };
    THREE.Material.prototype.dispose = function () { vusM.add(this); return dM.call(this); };
    try { for (const p of P) libererCorps(p); await Promise.all(P.map((p) => p.liberation)); }
    finally { THREE.BufferGeometry.prototype.dispose = dG; THREE.Material.prototype.dispose = dM; }
    const okG = vusG.size === attG.size && [...attG].every((g) => vusG.has(g));
    const okM = vusM.size === attM.size && [...attM].every((m) => vusM.has(m));
    return { ok: okG && okM && game.scene.children.length === enfants && P.every((p) => p.disposed),
      attendu: 'géométries et matériaux de chaque corps (bonhomme de secours compris) libérés, scène rendue',
      obtenu: `géométries ${vusG.size}/${attG.size} · matériaux ${vusM.size}/${attM.size} · enfants ${game.scene.children.length}/${enfants}` };
  }, { delai: 60 });

  // 23. LA ROUE DES PROVOCATIONS (squelette du prop hunt, Haythem prop)
  T('23 roue : chiffres sans pas, geste de la souris, T relâché ; jamais game.wheel', async () => {
    await jeu.lancer('prophunt', { graine: 23, zone: 'e1', acteurs: 4, premierRole: 'prop' });
    const p = game.partie, inp = game.input, c = p.local.cmd;
    const touche = (code, bas = true) => window.dispatchEvent(new KeyboardEvent(bas ? 'keydown' : 'keyup', { code }));
    const res = [];
    touche('Digit3'); touche('Digit3', false); inp.endFrame();               // une image SANS pas
    p.pas(PAS); res.push(['provoc3', c.provoc === 2]);
    touche('KeyT'); p.pas(PAS); res.push(['roue ouverte', p.roueOuverte()]);
    const yaw = game.camYaw;
    window.dispatchEvent(new MouseEvent('mousemove', { movementX: 80, movementY: 0 }));
    res.push(['choix 2', p.roue.choix === 2]); res.push(['caméra immobile', game.camYaw === yaw]);
    touche('KeyT', false); p.pas(PAS); res.push(['T relâché', c.provoc === 2 && !p.roueOuverte()]);
    res.push(['game.wheel fermée', !game.wheel.isOpen]);
    jeu.quitter('balade');
    const ko = res.filter((r) => !r[1]).map((r) => r[0]);
    return { ok: ko.length === 0, attendu: res.map((r) => r[0]).join(', '), obtenu: ko.length ? 'faux : ' + ko.join(', ') : 'tout vrai' };
  });

  // 24. LE MENU : la carte vivante suit le corps fictif ; le stand tourne 10 s
  T('24 menu : carte sous la caméra ; stand 10 s', async () => {
    jeu.quitter('menu');
    let pos = null;
    const maj = game.carte.maj;
    game.carte.maj = function (dt, j) { pos = j.user.pos.clone(); return maj.call(this, dt, j); };
    try { game.frame(1 / 60); } finally { game.carte.maj = maj; }
    const c = game.camera.position, sol = game.collisions.solEn(c.x, c.z, c.y);
    const okMenu = game.mode === 'menu' && !!pos && Math.hypot(pos.x - c.x, pos.z - c.z) <= 0.1 && Math.abs(pos.y - sol) <= 0.1;
    let err = null;
    try { await jeu.lancer('stand', {}); jeu.avancer(10); await jeu.images(10); } catch (e) { err = String(e); }
    const nC = game.partie ? game.partie.acteurs.filter((a) => a.role === 'cible').length : 0;
    jeu.quitter('balade');
    return { ok: okMenu && !err && nC === 6, attendu: 'menu : corps à ± 0,1 m sous la caméra ; stand : 6 cibles, 10 s sans exception',
      obtenu: `menu ${okMenu} (${pos ? pos.toArray().map(r2) : '-'} / caméra ${[c.x, c.z].map(r2)}, sol ${r2(sol)}) · stand ${err || 'ok'} · ${nC} cibles` };
  }, { delai: 60 });

  // 25. LE CERVEAU MINIMAL : il trouve, il vise à σ∞, le chasseur ne distingue pas les props
  T('25 cerveau minimal : élimination 2 c. 2 au −1, écart σ∞, chasseur', async (t) => {
    // (a) équipes 2 c. 2 de bots au −1
    await jeu.lancer('equipes', { graine: 25, humain: false, zone: 'ss', allies: 2, ennemis: 2 });
    let elims = 0; const d0 = game.partie.sur('elim', () => elims++);
    jeu.avancer(126, { vitesse: 8 }); d0();
    jeu.quitter('balade');
    // (b) l'écart de visée : un bot Régulier à 10 m d'un buste immobile
    await jeu.lancer('essai', { graine: 26, mannequins: [], humain: false });
    const p = game.partie, L = ligneLibre(p, 10) || [{ x: 2, y: 0, z: 4.5 }, { x: 12, y: 0, z: 4.5 }];
    const bot = p.ajouterActeur({ id: 1, nom: 'Tireur', equipe: 'A', x: L[0].x, y: L[0].y, z: L[0].z, lacet: -Math.PI / 2, classe: 'assaut', cerveau: 'minimal', difficulte: 'regulier' });
    const cib = p.ajouterActeur({ id: 2, nom: 'Buste', equipe: 'B', x: L[1].x, y: L[1].y, z: L[1].z, lacet: Math.PI / 2, cerveau: null });
    cib.vie = cib.vieMax = 1e9;
    const ang = [];
    const d1 = p.sur('tir', (e) => {
      if (e.a !== 1) return;
      const bx = cib.pos.x - e.ox, by = cib.pos.y + 1.27 - e.oy, bz = cib.pos.z - e.oz, L = Math.hypot(bx, by, bz);
      ang.push(Math.acos(Math.max(-1, Math.min(1, (bx * e.dx + by * e.dy + bz * e.dz) / L))) / DEG);
    });
    jeu.avancer(40); d1();
    const vu = p.balistique.vue(bot.pos.x, bot.pos.y + 1.62, bot.pos.z, cib.pos.x, cib.pos.y + 1.27, cib.pos.z);
    jeu.quitter('balade');
    const s = ang.slice().sort((a, b) => a - b), med = s.length ? s[s.length >> 1] : NaN;
    // (c) le chasseur minimal : 40 tirs de test, la part sur des props = leur part parmi les candidats
    await jeu.lancer('prophunt', { graine: 27, humain: false, zone: 'e1', acteurs: 5, difficulte: 'facile' });
    const q = game.partie, n0 = MEUBLES.poses.length;
    let faux = 0, choix = 0, part = 0;
    try {
      for (let i = 0; i < 8000 && q.phase !== 'traque'; i++) q.pas(PAS);
      const props = q.acteurs.filter((a) => a.role === 'prop'), chas = q.acteurs.filter((a) => a.role === 'chasseur');
      for (const a of props) { a.vie = a.vieMax = 1e9; }              // (les props tiennent : on compte des CHOIX, pas des morts)
      // de vrais meubles (fictifs) autour de chaque prop : trois chacun
      for (const a of props) for (let k = 0; k < 3; k++) {
        const an = (k / 3) * 2 * Math.PI, x = a.pos.x + Math.cos(an) * 0.9, z = a.pos.z + Math.sin(an) * 0.9;
        MEUBLES.poses.push({ i: MEUBLES.poses.length, cle: 'carton', x, y: a.pos.y, z, cap: 0, zone: null, cx: x, cz: z, hx: 0.22, hz: 0.22, y0: a.pos.y, y1: a.pos.y + 0.35, c: 1, s: 0 });
        faux++;
      }
      // les chasseurs ramenés à 4 m d'un groupe de meubles, toutes les 8 s (ils errent en ligne droite au squelette)
      for (let k = 0; k < 60 && chas.reduce((n, h) => n + h.cerveau.journal.length, 0) < 40 && q.phase === 'traque'; k++) {
        chas.forEach((h, j) => {
          const a = props[(k + j) % props.length];
          for (let n = 0; n < 16; n++) {
            const an = k + j + n * Math.PI / 8, x = a.pos.x + 4 * Math.cos(an), z = a.pos.z + 4 * Math.sin(an);
            if (!game.collisions.libre(x, z, 0.3, a.pos.y) || !q.balistique.vue(x, a.pos.y + 1.62, z, a.pos.x, a.pos.y + 0.3, a.pos.z)) continue;
            jeu.teleporter(h.id, x, a.pos.y, z, Math.atan2(-(a.pos.x - x), -(a.pos.z - z))); h.cerveau.prochainTest = q.t;
            break;
          }
        });
        for (let i = 0; i < 8 * 120; i++) q.pas(PAS);
      }
      for (const h of chas) for (const e of h.cerveau.journal) {
        choix++;
        if (_refEstActeur(e.ref)) part++;
        e._part = e.refs.filter((r) => _refEstActeur(r)).length / e.refs.length;
      }
    } finally { MEUBLES.poses.length = n0; }
    const J = q.acteurs.filter((a) => a.role === 'chasseur').flatMap((h) => h.cerveau.journal);
    const attenduPart = J.length ? J.reduce((s2, e) => s2 + e._part, 0) / J.length : 0, obtenuPart = choix ? part / choix : 0;
    jeu.quitter('balade');
    t.note('écart médian (°)', med);
    const okA = elims >= 1, okB = vu && ang.length >= 30 && med >= 1.9 * 0.7 && med <= 1.9 * 1.3, okC = choix >= 40 && Math.abs(obtenuPart - attenduPart) <= 0.2;
    return { ok: okA && okB && okC, attendu: '≥ 1 élimination en 2 min ; écart médian 1,9° ± 30 % ; 40 tirs de test, part des props = leur part ± 20 points',
      obtenu: `${elims} élim. · écart médian ${med.toFixed(2)}° sur ${ang.length} balles (vue ${vu}) · ${choix} tirs de test, props ${(obtenuPart * 100).toFixed(0)} % pour ${(attenduPart * 100).toFixed(0)} % des candidats` };
  }, { delai: 300 });

  // 27 (§ 6.1). LA BALADE APRÈS TOUTES CES PARTIES : toujours au bit près (le retour d'une partie rend l'école de la balade)
  T('27 balade rejouée au bit près après les parties', async () => {
    await jeu.lancer('essai', { graine: 28, mannequins: 3, bots: 2 }); jeu.avancer(3); jeu.quitter('balade');
    const r = await jeu.rejouerBalade();
    return { ok: r.ok && r.identiques && r.fonctionsRendues, attendu: 'écart ≤ seuils après une partie (et toutes celles des tests d’avant)',
      obtenu: `vue 3 ${r.vue3.pos} / ${r.vue3.cam} · vue 1 ${r.vue1.pos} / ${r.vue1.cam} · même onglet ${r.identiques}` };
  });

  // 26. LES DOCUMENTS, LES AVATARS
  T('26 docs/jeu, assets/tel', async () => {
    const docs = ['spec_finale.md', 'conception_archi.md', 'conception_cod.md', 'conception_prophunt.md', 'carte_coeur.md', 'carte_monde.md', 'carte_persos.md', 'carte_props.md',
      'carte_cage.md', 'critique.md', 'banc/armer.js', 'banc/accroupi.js', 'banc/ragdoll.js', 'banc/touches.js', 'banc/bras_fps.js'];
    const tailles = { gabriel: 2545064, imad: 2451740, marcantoine: 2510840, koji: 2075620, djafar: 1819440, ethan: 2626128 };
    const manque = [];
    for (const d of docs) { const r = await fetch(new URL('../../../docs/jeu/' + d, import.meta.url), { method: 'HEAD', cache: 'no-cache' }); if (!r.ok) manque.push(d); }
    for (const [k, n] of Object.entries(tailles)) {
      const r = await fetch(new URL('../../../assets/tel/' + k + '.glb', import.meta.url), { method: 'HEAD', cache: 'no-cache' });
      if (!r.ok || +r.headers.get('content-length') !== n) manque.push(k + '.glb ' + r.headers.get('content-length'));
    }
    return { ok: manque.length === 0, attendu: '15 documents, 6 avatars aux tailles de LA CAGE (le dossier des jetons : vérifié en ligne de commande)', obtenu: manque.length ? manque.join(', ') : 'tout là' };
  });

  // 28 (§ 6.1, « balade fonctionnelle »). Les vues (C : 3 → 2 → 1 → 4 → 3), une emote, le téléphone (l'entrée bloquée puis
  // rendue), un rang serré où l'on se faufile, les pas des couches PROGRAMMÉS au journal audio, l'endurance au sprint
  // (− 22/s), l'aide des touches à l'arrivée en balade. (Les rangs serrés sont ceux de la S −1.14, de la S 1.3 et de la
  // salle 2 du 2e : la David Clark n'en a pas — le premier rang ouvert de Player.rangs.)
  T('28 balade fonctionnelle : vues, emote, téléphone, rang, pas, endurance, aide', async () => {
    const u = game.user, inp = game.input, res = [];
    const code = (id) => (inp.bind[id] || []).find((c) => c && !c.startsWith('Tactile:'));
    const tenir = (id, oui) => { const c = code(id); if (oui) inp.downSet.add(c); else inp.downSet.delete(c); };
    // les vues
    const SUIV = { 3: 2, 2: 1, 1: 4, 4: 3 }, vues = [], attendu = [];
    let v = game.vue;
    for (let i = 0; i < 4; i++) {
      v = SUIV[v]; attendu.push(v);
      inp.presser(code('camera')); game.frame(1 / 60); inp.relacher(code('camera')); game.frame(1 / 60); vues.push(game.vue);
    }
    res.push(['vues ' + vues.join('→'), egal(vues, attendu)]);
    // une emote
    game.doEmote(0); res.push(['emote', !!u.emote]); u.stopEmote();
    // le téléphone (P) : l'entrée bloquée tant qu'il est ouvert
    const ph = window.__phone;
    if (ph) {
      inp.presser(code('phone')); game.frame(1 / 60); inp.relacher(code('phone'));
      const ouvert = !!ph.open && inp.blocked;
      ph.toggle(); game.frame(1 / 60);
      res.push(['téléphone', ouvert && !ph.open && !inp.blocked]);
    }
    // un rang serré : poussé contre son bout ouvert, Haythem s'y faufile
    const R = Player.rangs.find((r) => r.ouvA);
    if (R) {
      game.placerAuDepart();
      u.pos.set(R.ax - R.ux * 0.05, R.sol, R.az - R.uz * 0.05); u.vel.set(0, 0, 0); game.carte.maj(0, game);
      game.camYaw = Math.atan2(-R.ux, -R.uz); tenir('forward', true);
      for (let i = 0; i < 24 && !u.rang; i++) game.update(PAS);
      tenir('forward', false);
      res.push(['rang (' + R.nom + ')', !!u.rang && u.rang.R === R]);
      u.rang = null;
    }
    // l'endurance au sprint, puis les pas (course vers la salle d'attente)
    game.placerAuDepart(); u.stamina = 100;
    const J = jeu.journalAudio, cible = { x: 9.6, z: -6.755 };
    const viser = () => { game.camYaw = Math.atan2(-(cible.x - u.pos.x), -(cible.z - u.pos.z)); };
    tenir('forward', true); tenir('sprint', true);
    for (let i = 0; i < 60; i++) { viser(); game.update(PAS); }
    const perte = 100 - u.stamina;
    tenir('sprint', false); J.vider();
    for (let i = 0; i < 240; i++) { viser(); game.update(PAS); if (i % 2) { game.carte.maj(1 / 60, game); game.updateCamera(1 / 60); } }
    tenir('forward', false);
    const starts = J.entrees.filter((e) => e.methode === 'start').length;
    res.push([`endurance − ${r2(perte)} en 0,5 s`, Math.abs(perte - 11) <= 0.5]);
    res.push([`pas programmés : ${starts}`, starts >= 6]);
    // l'aide des touches, à l'arrivée en balade (enterLobby sans argument)
    game.placerAuDepart(); game.enterLobby();
    const hint = document.getElementById('hud-hint');
    res.push(['aide des touches', !!hint && !!hint.textContent.trim()]);
    game.placerAuDepart();
    const ko = res.filter((r) => !r[1]).map((r) => r[0]);
    return { ok: ko.length === 0, attendu: 'vues, emote, téléphone, rang, endurance − 11 ± 0,5 en 0,5 s, ≥ 6 pas programmés, aide affichée',
      obtenu: ko.length ? 'faux : ' + ko.join(', ') : res.map((r) => r[0]).join(' · ') };
  });

  // 29 (§§ 6.1, 6.2). CE QUE LA BALADE MONTRE ET GARDE : le HUD (empreinte = référence de a8b22dd, sans body.combat,
  // l'endurance visible), le tactile (`__touch._contexte()` = référence), les touches par défaut (ACTIONS de a8b22dd), les
  // boutons de la pause (ceux d'aujourd'hui, plus « Modes de jeu ») ; et le menu ne change rien à la balade (menu →
  // BALADE LIBRE → rejeu au bit près)
  const ACTIONS_A8B22DD = '7f1f1f5d';           // (hacher des [id, def, pad] d'ACTIONS sur a8b22dd)
  T('29 balade : HUD, tactile, touches, pause, menu = référence', async () => {
    const ref = jeu.reference[profil()], res = [];
    for (let i = 0; i < 3; i++) game.frame(1 / 60);
    res.push(['HUD', window.__rejeuBalade.empreinteHud() === ref.hud]);
    const st = document.querySelector('.stamina');
    res.push(['sans body.combat, endurance visible', !document.body.classList.contains('combat') && !!st && getComputedStyle(st).display !== 'none']);
    const tact = window.__touch && window.__touch._contexte ? window.__touch._contexte() : null;
    res.push(['tactile', egal(tact, ref.tactile)]);
    res.push(['touches', hacher(ACTIONS.map((a) => [a.id, a.def, a.pad || null])) === ACTIONS_A8B22DD]);
    game.togglePause();
    const B = [...document.querySelectorAll('#overlay-buttons button')].map((b) => b.textContent.trim());
    game.togglePause();
    res.push(['pause', egal(B, ['Reprendre', 'Options', 'Commandes', 'Revenir au départ', 'Modes de jeu']) && !game.paused]);
    jeu.quitter('menu'); for (let i = 0; i < 30; i++) game.frame(1 / 60);
    const menu = game.mode === 'menu';
    jeu.quitter('balade');
    const r = await jeu.rejouerBalade();
    res.push(['menu, puis la balade au bit près', menu && r.ok && r.identiques]);
    const ko = res.filter((x) => !x[1]).map((x) => x[0]);
    return { ok: ko.length === 0, attendu: res.map((x) => x[0]).join(', '), obtenu: ko.length ? 'faux : ' + ko.join(', ') + ' (pause : ' + B.join(' / ') + ')' : 'tout vrai' };
  }, { delai: 120 });
}
