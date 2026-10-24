// =====================================================================
//  LES TESTS DE LA PROGRESSION — lot L-P (vague 3, 24/10 ; spec § 5.7.3, acceptation, points 1 à 11)
// =====================================================================
// Lancés par le harnais sous `?test=1&rapport=1&lot=L-P` (window.__rapport). Le profil est EN MÉMOIRE sous ?test=1 (celui de
// Haythem n'est jamais touché) ; chaque test repart d'un profil neuf, ou d'un niveau posé (`reinitialiser({ xp })`). Les
// parties sont de VRAIES parties de combat (js/jeu/partie_fps.js), leurs bots figés quand le test veut tout tenir : les
// éliminations passent par la vraie porte des dégâts (`partie.infliger`), les séries par la vraie commande (`serie`), les
// armes au sol par le vrai `interagir`, les accessoires et les atouts par le vrai Arsenal et le vrai mouvement.
import * as THREE from 'three';
import { PAS } from '../constantes.js';
import { ARMES, CLASSES, Arsenal } from '../armes.js';
import { entree, PAD_BOUTONS } from '../../settings.js';
import { etatMvt } from '../mouvement.js';
import { hacher } from '../rng.js';
import { MENUS } from '../menus_jeu.js';
import { Profil, stockageMemoire, xpPourNiveau, niveauDe, coutNiveau, xpDeScore, DEBLOCAGES, niveauRequis, XP, PROFIL_CLE, tirerDefis, CLASSES_DEPART, dateDuJour } from '../profil.js';
import { MEDAILLES, SERIES, ACCESSOIRES, ATOUTS, ficheEquipee, equiperArsenal, xpSerie } from '../series.js';
import { REGLES_SOL } from '../armes_au_sol.js';
import { AffProgression } from '../aff_progression.js';
import { STAND } from '../partie_stand.js';

const r2 = (v) => Math.round(v * 100) / 100, r3 = (v) => Math.round(v * 1000) / 1000;
const egal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const bilan = (res, attendu) => { const ko = res.filter((x) => !x[1]).map((x) => x[0]); return { ok: ko.length === 0, attendu, obtenu: ko.length ? 'faux : ' + ko.join(' | ') : res.map((x) => x[0]).join(' · ') }; };
const I = Object.fromEntries(PAD_BOUTONS.map((n, i) => [n, i]));
const vu = (el) => !!el && !el.hidden && el.getClientRects().length > 0;
const DEG = Math.PI / 180;

export default function (jeu) {
  const game = window.__game;
  const T = (nom, fn, opts) => jeu.ajouterTest('L-P', nom, fn, opts);
  const profil = new Profil();
  // un profil neuf, en mémoire (ou au niveau `n`)
  // (les défis du jour : trois défis du stand impossibles — 999 à faire, 0 XP — : un test ne voit pas un défi de la date
  // tomber au milieu de son barème)
  const DEFIS_NEUTRES = () => ({ date: dateDuJour(), liste: [0, 1, 2].map(() => ({ id: 'stand', n: 999, xp: 0, fait: 0, fini: false, texte: 'neutre' })) });
  const neuf = (n = 1, d = {}) => { Profil.utiliserStockage(stockageMemoire()); return profil.reinitialiser({ xp: xpPourNiveau(n), defis: DEFIS_NEUTRES(), ...d }); };
  // (à la fin de chaque test : le profil de test d'un onglet neuf — vide, donc au niveau 40 —, pour les tests qui suivent)
  const rendre = () => { Profil.utiliserStockage(stockageMemoire()); };
  // l'équipement d'une classe personnalisée, posé tel quel (le test choisit l'accessoire et l'atout)
  const equipe = (o = {}) => ({ classe: 'perso1', nom: 'TEST', principale: 'fa24', secondaire: 'p17', letale: ['frag', 1], tactique: ['flash', 1], accessoire: null, atout: null, camo: null, ...o });
  // UNE PARTIE DE COMBAT jusqu'à la manche, ses bots FIGÉS (sans cerveau, sans arme qui tire, immobiles) sauf `vivants`
  const combat = async (o = {}, { figer = true, vivants = [] } = {}) => {
    await jeu.lancer(o.mode || 'equipes', { graine: 21, zone: 'ecole', allies: 2, ennemis: 4, difficulte: 'recrue', duree: 600, ...o });
    const p = game.partie;
    if (figer) for (const a of p.acteurs) if (!a.local && !vivants.includes(a.id)) figerBot(a);
    jeu.avancer(6.2);
    return p;
  };
  const figerBot = (a) => { if (a.cerveau) { a.cerveau.liberer?.(); a.cerveau = null; } a.cmd.tir = false; a.cmd.ax = 0; a.cmd.ay = 0; a.cmd.sprint = false; };
  const L = () => game.partie.local;
  const ennemis = (p) => p.acteurs.filter((a) => !a.local && p.ennemis(p.local, a));
  const allies = (p) => p.acteurs.filter((a) => !a.local && !p.ennemis(p.local, a));
  // devant Haythem, à `d` m (sur son cap)
  const devant = (p, d) => { const a = p.local, l = a.cmd.lacet; return { x: a.pos.x - Math.sin(l) * d, y: a.pos.y, z: a.pos.z - Math.cos(l) * d }; };
  // UNE ÉLIMINATION par la porte des dégâts : la cible posée à `d` m devant le tueur (Haythem par défaut), puis 10 000 dégâts
  const tuer = (p, cible, o = {}) => {
    const par = o.par ?? p.local.id, k = p.acteurParId(par), d = o.d ?? 8;
    if (o.d !== null) { const l = k.cmd.lacet; jeu.teleporter(cible.id, k.pos.x - Math.sin(l) * d, k.pos.y, k.pos.z - Math.cos(l) * d); }
    cible.protegeT = 0;
    return p.infliger(cible, 1e4, { par, arme: o.arme || 'fa24', zone: o.zone || 'torse', x: cible.pos.x, y: cible.pos.y + 1.2, z: cible.pos.z, dx: 0, dy: 0, dz: -1 });
  };
  const ecouter = (p, type) => { const L0 = []; const d = p.sur(type, (e) => L0.push(e)); return { L: L0, fin: d }; };

  // 1. LE BARÈME D'XP, exact pour chaque événement ; le cumul : niveau 10 à 14 400 XP, niveau 40 à 179 400
  T('1 barème d’XP et niveaux', async () => {
    const res = [];
    res.push([`niveau 10 à ${xpPourNiveau(10)} XP, 40 à ${xpPourNiveau(40)}`, xpPourNiveau(10) === 14400 && xpPourNiveau(40) === 179400]);
    let okCout = true; for (let n = 1; n < 40; n++) okCout = okCout && xpPourNiveau(n + 1) - xpPourNiveau(n) === coutNiveau(n) && coutNiveau(n) === 800 + 200 * (n - 1);
    res.push(['n → n + 1 coûte 800 + 200 (n − 1)', okCout]);
    res.push([`niveauDe : 14 399 → ${niveauDe(14399)}, 14 400 → ${niveauDe(14400)}, 179 400 → ${niveauDe(179400)}, 10⁷ → ${niveauDe(1e7)}`,
      niveauDe(14399) === 9 && niveauDe(14400) === 10 && niveauDe(179400) === 40 && niveauDe(1e7) === 40 && niveauDe(0) === 1]);
    // sur une VRAIE partie (pendant sa présentation : ni séries ni médailles ne s'y mêlent), chaque événement de Haythem
    neuf(1);
    await jeu.lancer('equipes', { graine: 4, zone: 'ecole', allies: 1, ennemis: 1 });
    const p = game.partie, id = p.local.id, P = p.aff.profil;
    const cas = [
      ['élimination', 'score', { id, points: 100, raison: 'elim' }, 100],
      ['élimination à la tête', 'score', { id, points: 125, raison: 'elim', tete: true }, 125],
      ['au couteau', 'score', { id, points: 125, raison: 'elim', couteau: true }, 125],
      ['au-delà de 30 m', 'score', { id, points: 150, raison: 'elim', loin: true }, 150],
      ['défense', 'score', { id, points: 150, raison: 'elim', defense: true }, 150],
      ['assistance', 'score', { id, points: 50, raison: 'assistance' }, 25],
      ['capture', 'score', { id, points: 150, raison: 'capture' }, 150],
      ['neutralisation', 'score', { id, points: 75, raison: 'neutralisation' }, 75],
      ['point de domination (équipe)', 'score', { id, points: 1, raison: 'point' }, 0],
      ['suicide', 'score', { id, points: -100, raison: 'suicide' }, 0],
      ['série de 3', 'serie', { a: id, n: 3, id: 'drone', etat: 'atteinte', xp: xpSerie(3) }, 150],
      ['série de 5', 'serie', { a: id, n: 5, id: 'gilet', etat: 'atteinte', xp: xpSerie(5) }, 250],
      ['série de 7', 'serie', { a: id, n: 7, id: 'sentinelle', etat: 'atteinte', xp: xpSerie(7) }, 350],
      ['série de 9', 'serie', { a: id, n: 9, id: null, etat: 'atteinte', xp: xpSerie(9) }, 450],
      ['série lancée (rien)', 'serie', { a: id, n: 7, id: 'drone', etat: 'lancee' }, 0],
      ['le score d’un autre', 'score', { id: id + 1, points: 100, raison: 'elim' }, 0],
      ...Object.entries(MEDAILLES).map(([m, M]) => [`médaille ${M.nom}`, 'medaille', { a: id, id: m, xp: M.xp }, M.xp]),
      ['sentinelle détruite', 'score', { id, points: 50, raison: 'sentinelle' }, 50],
    ];
    const fautes = [];
    for (const [nom, type, data, att] of cas) { const x0 = P.xp; p.evt(type, data); if (P.xp - x0 !== att) fautes.push(`${nom} ${P.xp - x0}/${att}`); }
    res.push([`${cas.length} événements au barème${fautes.length ? ' — ' + fautes.join(', ') : ''}`, !fautes.length]);
    res.push([`médailles de 25 à 100 (${Object.values(MEDAILLES).map((M) => M.xp).join(' ')})`, Object.values(MEDAILLES).every((M) => M.xp >= 25 && M.xp <= 100) && Object.keys(MEDAILLES).length === 16]);
    // la fin : victoire 400, partie finie 200
    let x0 = P.xp; p.evt('fin', { gagnant: p.local.equipe }); const v = P.xp - x0;
    // (l'écran de fin — celui du MENU, une autre instance du profil — montre le bilan d'XP de la partie : total, lignes, barre)
    const bx = document.querySelector('#fin-jeu .fj-xp'), tb = bx ? bx.textContent.replace(/\s+/g, ' ') : '';
    res.push([`écran de fin : bilan d'XP « ${tb.slice(0, 90)}… »`, !!bx && /\+[\d\s ]+XP/.test(tb) && /VICTOIRE/.test(tb) && /MÉDAILLES/.test(tb) && !!bx.querySelector('.fj-xp-barre i')]);
    jeu.quitter('balade');
    await jeu.lancer('equipes', { graine: 5, zone: 'ecole', allies: 1, ennemis: 1 });
    const p2 = game.partie; x0 = P.xp; p2.evt('fin', { gagnant: p2.local.equipe === 'A' ? 'B' : 'A' }); const f = P.xp - x0;
    jeu.quitter('balade');
    res.push([`fin : victoire +${v}, défaite +${f}`, v === XP.victoire && f === XP.finPartie && v === 400 && f === 200]);
    res.push([`xpDeScore : prop hunt « provocation » 7 → ${xpDeScore({ raison: 'provocation', points: 7 })}, « meuble » −2 → ${xpDeScore({ raison: 'meuble', points: -2 })}`,
      xpDeScore({ raison: 'provocation', points: 7 }) === 7 && xpDeScore({ raison: 'meuble', points: -2 }) === 0]);
    rendre();
    return bilan(res, 'niveau 10 à 14 400, 40 à 179 400 ; chaque événement à son XP (CoD § 11), médailles 25-100, victoire 400 / fin 200');
  });

  // 2. LES DÉBLOCAGES aux niveaux de la table ; un objet verrouillé n'est pas proposé
  T('2 déblocages ; un objet verrouillé n’est pas proposé', async () => {
    const res = [];
    let faux = [];
    for (const D of DEBLOCAGES) for (const q of D.quoi) {
      if (niveauRequis(q.type, q.id) !== D.niveau) faux.push(`${q.nom} ${niveauRequis(q.type, q.id)}≠${D.niveau}`);
      if (D.niveau > 1 && profil.deverrouille(q.type, q.id, D.niveau - 1)) faux.push(`${q.nom} ouvert au ${D.niveau - 1}`);
      if (!profil.deverrouille(q.type, q.id, D.niveau)) faux.push(`${q.nom} fermé au ${D.niveau}`);
    }
    const n = DEBLOCAGES.reduce((s, D) => s + D.quoi.length, 0);
    res.push([`${n} déblocages à leur niveau (CoD § 11 : 1 FA-24 P-17 frag flash Assaut · 2 PM-9 · 4 FP-12 · 6 perso · 8 TP-50 · 10-16 accessoires · 18-26 atouts · 30+ camouflages)${faux.length ? ' — ' + faux.join(', ') : ''}`,
      !faux.length && niveauRequis('arme', 'pm9') === 2 && niveauRequis('accessoire', 'silencieux') === 16 && niveauRequis('atout', 'fantome') === 26 && niveauRequis('classe', 'perso3') === 6]);
    // l'équipement : ce qui n'est pas débloqué est retiré
    const e1 = profil.equipement('tireur', 1), e17 = profil.equipement('assaut', 17), e18 = profil.equipement('assaut', 18), e16 = profil.equipement('infiltration', 16), e15 = profil.equipement('infiltration', 15);
    res.push([`équipement : Tireur au niveau 1 → ${e1.classe} ; Assaut 17 → atout ${e17.atout}, 18 → ${e18.atout} ; Infiltration 15 → ${e15.accessoire}, 16 → ${e16.accessoire}`,
      e1.classe === 'assaut' && e17.atout === null && e18.atout === 'endurance' && e15.accessoire === null && e16.accessoire === 'silencieux']);
    neuf(6); profil.poserClasse('perso2', { nom: 'X', principale: 'tp50', accessoire: 'silencieux', secondaire: 'p17', letale: 'frag', tactique: 'flash', atout: 'fantome', camo: 'nuit' });
    const p6 = profil.equipement('perso2', 6);
    res.push([`classe perso au niveau 6 : ${p6.principale} (TP-50 verrouillé → FA-24), accessoire ${p6.accessoire}, atout ${p6.atout}, camo ${p6.camo}`, p6.principale === 'fa24' && !p6.accessoire && !p6.atout && !p6.camo]);
    // LE MENU : au niveau 1, les classes verrouillées grisées ; l'option lancée revient à l'Assaut
    neuf(1);
    jeu.quitter('menu'); for (let i = 0; i < 2; i++) game.frame(1 / 60);
    const M = MENUS.courant;
    M._poser('jeu.combat.classe', 'tireur'); M.reglage('combat');
    const B = (id) => document.querySelector(`#reglage-jeu [data-champ="jeu.combat.classe"][data-v='"${id}"']`);
    const g1 = ['infiltration', 'defense', 'tireur'].every((id) => B(id) && B(id).disabled), a1 = B('assaut') && !B('assaut').disabled, p1 = !B('perso1') && !B('perso5');
    const o1 = M.optionsDe('combat').opts;
    res.push([`niveau 1 : Infiltration, Défense, Tireur grisés ${g1}, Assaut libre ${a1}, aucune classe perso proposée ${p1} ; lancé : ${o1.classe} (équipement ${o1.equipement && o1.equipement.classe})`,
      g1 && a1 && p1 && o1.classe === 'assaut' && o1.equipement.classe === 'assaut']);
    // (une classe perso verrouillée prise quand même — un profil d'un autre appareil — : lancée en Assaut)
    M._poser('jeu.combat.classe', 'perso2'); const o1b = M.optionsDe('combat').opts;
    res.push([`niveau 1, Perso 2 dans les réglages : lancé ${o1b.classe} / ${o1b.equipement.classe}`, o1b.equipement.classe === 'assaut']);
    neuf(8); M._poser('jeu.combat.classe', 'tireur'); M.reglage('combat');
    const g8 = !B('tireur').disabled && B('tireur').classList.contains('on'), o8 = M.optionsDe('combat').opts;
    res.push([`niveau 8 : Tireur proposé ${g8} ; lancé : ${o8.classe}`, g8 && o8.classe === 'tireur' && o8.equipement.principale === 'tp50']);
    M._poser('jeu.combat.classe', 'perso3'); M.reglage('combat');
    const g8b = !!B('perso3') && B('perso3').classList.contains('on') && !B('perso1'), o8b = M.optionsDe('combat').opts, mc = !!document.querySelector('#reglage-jeu [data-act="mesClasses"]');
    res.push([`niveau 8, Perso 3 prise à l'armurerie : proposée ${g8b} (les autres non), lancée ${o8b.equipement.classe}, « MES CLASSES » ${mc}`, g8b && o8b.equipement.classe === 'perso3' && mc]);
    // L'ARMURERIE au niveau 11 : le point rouge proposé, la poignée (12) non ; l'atout aucun
    neuf(11); M.prog.armurerie('perso1');
    const acc = (id) => document.querySelector(`#armurerie-jeu [data-champ="accessoire"][data-v='"${id}"']`), atout = (id) => document.querySelector(`#armurerie-jeu [data-champ="atout"][data-v='"${id}"']`);
    const okA = acc('pointRouge') && !acc('pointRouge').disabled && acc('poignee').disabled && acc('silencieux').disabled && Object.keys(ATOUTS).every((k) => atout(k).disabled);
    res.push([`armurerie niveau 11 : point rouge ouvert, poignée / silencieux / atouts grisés ${okA}`, !!okA]);
    M._poser('jeu.combat.classe', 'assaut'); M.accueil();
    rendre();
    return bilan(res, 'chaque déblocage à son niveau ; ce qui est verrouillé est grisé et jamais lancé');
  }, { delai: 90 });

  // 3. LES ACCESSOIRES mesurés par l'Arsenal : point rouge zoom × 1,30 ; poignée 12 balles → 5,41°, ADS + 0,02 ; chargeur
  //    étendu 45 balles, ADS + 0,04, recharge + 0,2 ; silencieux bruit 8 m, pas de point sur la mini-carte, paliers − 15 %
  T('3 accessoires mesurés par l’Arsenal', async () => {
    const res = [];
    neuf(40);
    // le temps de visée : du premier pas `visee` à visee = 1
    const tempsAds = (p) => { const A = p.local.arsenal; jeu.commande(0, { visee: false }, PAS * 30); jeu.avancer(PAS * 30); const t0 = p.t; let n = 0;
      jeu.commande(0, { visee: true }, 1); while (A.vk < 1 - 1e-9 && n++ < 240) jeu.avancer(PAS); const t = p.t - t0; jeu.commande(0, { visee: false }, PAS); jeu.avancer(PAS * 60); return t; };
    // la montée de 12 balles tenues, à la hanche (le recul de visée, pris par lireCommande au pas qui suit chaque tir) : la
    // détente tenue pas à pas jusqu'au 12e tir, relâchée, un pas de plus
    const montee = (p) => {
      const A = p.local.arsenal; jeu.avancer(1); game.camPitch = 0; const c0 = game.camPitch, s0 = A.tirSeq;
      let n = 0; while (A.tirSeq - s0 < 12 && n++ < 400) { jeu.commande(0, { tir: true }, PAS); jeu.avancer(PAS); }
      jeu.commande(0, { tir: false }, PAS); jeu.avancer(PAS);
      return { d: (c0 - game.camPitch) / DEG, n: A.tirSeq - s0 };
    };
    // une recharge tactique : du 'debut' à la 'fin'
    const recharge = (p) => { const E = ecouter(p, 'recharge'); jeu.tirer(0, { n: 3, cible: { lacet: game.camYaw, tangage: 0 } }); jeu.avancer(0.5);
      jeu.commande(0, { recharger: true }, PAS); jeu.avancer(4); E.fin(); const a = E.L.find((e) => e.phase === 'debut' && e.a === 0), b = E.L.find((e) => e.phase === 'fin' && e.a === 0); return a && b ? b.t - a.t : NaN; };
    // NUE
    let p = await combat({ equipement: equipe() });
    const ads0 = tempsAds(p), m0 = montee(p), rc0 = recharge(p);
    jeu.quitter('balade');
    res.push([`FA-24 nue : visée ${r3(ads0)} s, 12 balles ${r2(m0.d)}°, recharge tactique ${r3(rc0)} s`, Math.abs(ads0 - 0.26) <= PAS + 1e-6 && Math.abs(m0.d - 6.76) < 0.06 && Math.abs(rc0 - 1.9) <= PAS + 1e-6]);
    // POINT ROUGE
    p = await combat({ equipement: equipe({ accessoire: 'pointRouge' }) });
    jeu.commande(0, { visee: true }, 1); jeu.avancer(0.5);
    const z = p.vue._zoomDe(p.local).zoom;
    res.push([`point rouge : zoom ${r3(p.local.arsenal.arme.zoom)}, en visée ${r3(z)} (× 1,30)`, p.local.arsenal.arme.zoom === 1.30 && Math.abs(z - 1.30) < 1e-6]);
    jeu.quitter('balade');
    // POIGNÉE
    p = await combat({ equipement: equipe({ accessoire: 'poignee' }) });
    const ads1 = tempsAds(p), m1 = montee(p);
    jeu.quitter('balade');
    res.push([`poignée : ${m1.n} balles ${r2(m1.d)}° (5,41 = × 0,8), visée ${r3(ads1)} s (+ 0,02)`, m1.n === 12 && Math.abs(m1.d - 5.408) < 0.05 && Math.abs(ads1 - ads0 - 0.02) <= PAS + 1e-6]);
    // CHARGEUR ÉTENDU
    p = await combat({ equipement: equipe({ accessoire: 'chargeur' }) });
    const ch = p.local.arsenal.chargeur, res2 = p.local.arsenal.reserve, ads2 = tempsAds(p), rc2 = recharge(p);
    jeu.quitter('balade');
    res.push([`chargeur étendu : ${ch} / ${res2} balles, visée ${r3(ads2)} s (+ 0,04), recharge ${r3(rc2)} s (+ 0,2)`, ch === 45 && Math.abs(ads2 - ads0 - 0.04) <= PAS + 1e-6 && Math.abs(rc2 - rc0 - 0.2) <= PAS + 1e-6]);
    // SILENCIEUX : la fiche, l'événement, l'oreille d'un bot à 15 m, la mini-carte (un ENNEMI silencieux n'y paraît pas)
    const fS = ficheEquipee(ARMES.fa24, 'silencieux');
    res.push([`silencieux : bruit ${fS.bruit} m, paliers ${fS.degats.map((x) => x[0]).join(' / ')} (15 / 30 − 15 %)`, fS.bruit === 8 && fS.silencieux === true && Math.abs(fS.degats[0][0] - 12.75) < 1e-9 && Math.abs(fS.degats[1][0] - 25.5) < 1e-9]);
    const oreille = async (acc) => {
      const q = await combat({ equipement: equipe({ accessoire: acc }), allies: 0, ennemis: 1 }, { vivants: [1] });
      const b = q.acteurParId(1); b.gele = true; if (b.arsenal) b.arsenal.bloque = true;
      // (le bot à 15 m DERRIÈRE Haythem, qui tire devant lui : il ne le voit pas, il ne peut que l'entendre)
      const l = q.local.cmd.lacet; jeu.teleporter(1, q.local.pos.x + Math.sin(l) * 15, q.local.pos.y, q.local.pos.z + Math.cos(l) * 15);
      const E = ecouter(q, 'tir'); const i0 = b.cerveau.indices.length;
      jeu.tirer(0, { n: 2, cible: { lacet: l, tangage: 0.05 } }); E.fin();
      const r = { entendu: b.cerveau.indices.length > i0, bruit: E.L.find((e) => e.a === 0) || {} };
      jeu.quitter('balade');
      return r;
    };
    const o0 = await oreille(null), o1 = await oreille('silencieux');
    res.push([`un bot à 15 m derrière : FA-24 entendue ${o0.entendu}, silencieuse ${o1.entendu} (tir : bruit ${o1.bruit.bruit}, silencieux ${o1.bruit.silencieux})`, o0.entendu && !o1.entendu && o1.bruit.bruit === 8 && o1.bruit.silencieux === true]);
    const carte = async (acc) => {
      const q = await combat({ allies: 0, ennemis: 1 });
      const b = q.acteurParId(1);
      b.arsenal = new Arsenal(b, CLASSES.assaut);
      if (acc) equiperArsenal(b.arsenal, { accessoire: acc });
      await jeu.images(2);
      jeu.tirer(1, { n: 1, cible: { x: b.pos.x + 3, y: b.pos.y + 1, z: b.pos.z } });
      const vuP = q.aff.minicarte.pings.has(1);
      jeu.quitter('balade');
      return vuP;
    };
    const c0 = await carte(null), c1 = await carte('silencieux');
    res.push([`mini-carte : un ennemi qui tire montré ${c0}, silencieux ${c1}`, c0 && !c1]);
    rendre();
    return bilan(res, 'point rouge × 1,30 ; poignée 5,41° et + 0,02 s ; chargeur 45, + 0,04 s, + 0,2 s ; silencieux 8 m, pas entendu à 15 m, pas sur la mini-carte, paliers − 15 %');
  }, { delai: 180 });

  // 4. LES ATOUTS mesurés : Endurance (tactique 6 s, recharge de la jauge × 0,5), Main sûre (recharge × 0,75, changement × 0,8),
  //    Pas feutrés (rayon d'audition des bots ÷ 3), Récupération (régénération à 2,5 s), Fantôme (invisible au drone)
  T('4 atouts mesurés', async () => {
    const res = [];
    neuf(40);
    // ENDURANCE : la jauge en sprint tactique (1 s) et au repos (0,5 s)
    const jauge = async (atout) => {
      const p = await combat({ equipement: equipe({ atout }) }), a = p.local;
      jeu.commande(0, { ay: 1, amp: 1, sprint: true, sprintTact: true }, PAS * 2); jeu.avancer(PAS * 2);
      const tact = etatMvt(a).tact, j0 = a.jaugeTact;
      jeu.commande(0, { ay: 1, amp: 1, sprint: true }, 1.0); jeu.avancer(1.0);
      const j1 = a.jaugeTact;
      jeu.commande(0, { ay: 0, amp: 0, sprint: false, sprintTact: false }, 0.25); jeu.avancer(0.25);
      const j2 = a.jaugeTact;
      jeu.quitter('balade');
      return { tact, vide: j0 - j1, remplit: j2 - j1 };
    };
    const J0 = await jauge(null), J1 = await jauge('endurance');
    res.push([`Endurance : sprint tactique ${r2(1 / J1.vide)} s (sans : ${r2(1 / J0.vide)} s), jauge pleine en ${r2(0.25 / J1.remplit)} s (sans : ${r2(0.25 / J0.remplit)} s)`,
      J0.tact && J1.tact && Math.abs(1 / J1.vide - 6) < 0.1 && Math.abs(1 / J0.vide - 3) < 0.1 && Math.abs(0.25 / J1.remplit - 2) < 0.05 && Math.abs(0.25 / J0.remplit - 4) < 0.1]);
    // MAIN SÛRE : la recharge tactique de la FA-24 et le passage au P-17
    const mains = async (atout) => {
      const p = await combat({ equipement: equipe({ atout }) }), A = p.local.arsenal;
      const E = ecouter(p, 'recharge'); jeu.tirer(0, { n: 3, cible: { lacet: game.camYaw, tangage: 0 } }); jeu.avancer(0.5);
      jeu.commande(0, { recharger: true }, PAS); jeu.avancer(3); E.fin();
      const a = E.L.find((e) => e.phase === 'debut'), b = E.L.find((e) => e.phase === 'fin');
      jeu.commande(0, { armeN: 2 }, PAS); jeu.avancer(PAS); const t0 = p.t; let n = 0; while (A.etatArme === 'change' && n++ < 200) jeu.avancer(PAS);
      const ch = p.t - t0 + PAS;
      jeu.quitter('balade');
      return { rc: b.t - a.t, ch };
    };
    const M0 = await mains(null), M1 = await mains('mainSure');
    res.push([`Main sûre : recharge ${r3(M1.rc)} s (sans : ${r3(M0.rc)} ; × 0,75), changement ${r3(M1.ch)} s (sans : ${r3(M0.ch)} ; × 0,8)`,
      Math.abs(M1.rc - 1.9 * 0.75) <= PAS + 1e-6 && Math.abs(M0.rc - 1.9) <= PAS + 1e-6 && Math.abs(M1.ch - 0.8 * M0.ch) <= 2 * PAS + 1e-6]);
    // PAS FEUTRÉS : le rayon d'audition posé sur les pas de Haythem
    const pas = async (atout) => {
      const p = await combat({ equipement: equipe({ atout }) }), E = ecouter(p, 'pas');
      jeu.commande(0, { ay: 1, amp: 1 }, 1.2); jeu.avancer(1.2);
      jeu.commande(0, { ay: 1, amp: 1, sprint: true }, 1.2); jeu.avancer(1.2); E.fin();
      jeu.quitter('balade');
      const L0 = E.L.filter((e) => e.a === 0);
      return { course: (L0.find((e) => e.allure === 'course') || {}).rayon, sprint: (L0.find((e) => e.allure === 'sprint') || {}).rayon };
    };
    const P0 = await pas(null), P1 = await pas('pasFeutres');
    res.push([`Pas feutrés : course ${P1.course} m (sans : ${P0.course}), sprint ${r2(P1.sprint)} m (sans : ${P0.sprint})`, P0.course === 9 && P0.sprint === 14 && Math.abs(P1.course - 3) < 1e-9 && Math.abs(P1.sprint - 14 / 3) < 1e-9]);
    // RÉCUPÉRATION : quand la vie remonte après un coup
    const regen = async (atout) => {
      const p = await combat({ equipement: equipe({ atout }) }), a = p.local, e = ennemis(p)[0];
      p.infliger(a, 50, { par: e.id, arme: 'fa24', zone: 'torse' });
      const t0 = p.t, v0 = a.vie; let n = 0; while (a.vie <= v0 + 1e-9 && n++ < 800) jeu.avancer(PAS);
      jeu.quitter('balade');
      return p.t - t0;
    };
    const R0 = await regen(null), R1 = await regen('recuperation');
    res.push([`Récupération : la vie remonte à ${r2(R1)} s (sans : ${r2(R0)} s)`, Math.abs(R1 - 2.5) <= 2 * PAS + 1e-6 && Math.abs(R0 - 4.0) <= 2 * PAS + 1e-6]);
    // FANTÔME : le drone d'un bot ennemi le balaye-t-il ?
    const drone = async (atout) => {
      const p = await combat({ equipement: equipe({ atout }) }), e = ennemis(p)[0];
      p.series.de(e.id).dispo.push('drone'); p.series.lancer(e, 'drone'); jeu.avancer(PAS * 2);
      const D = p.series.drones[0], vu = !!D && D.vus.some((v) => v[0] === 0), mem = p.signalements(e.equipe).some((s) => s.id === 0);
      jeu.quitter('balade');
      return { vu, mem };
    };
    const F0 = await drone(null), F1 = await drone('fantome');
    res.push([`Fantôme : balayé par un drone ennemi ${F1.vu} (sans : ${F0.vu}), dans la mémoire des bots ${F1.mem} (sans : ${F0.mem})`, F0.vu && F0.mem && !F1.vu && !F1.mem]);
    rendre();
    return bilan(res, 'Endurance 6 s et 2 s ; Main sûre × 0,75 / × 0,8 ; Pas feutrés ÷ 3 ; Récupération à 2,5 s ; Fantôme invisible au drone');
  }, { delai: 180 });

  // 5. LES SÉRIES : drone 25 s (ennemis sur la mini-carte toutes les 2 s, sauf Fantôme) ; gilet pris avant la vie ; sentinelle
  //    40 s ou 300 PV, 25 % ± 5 de touches à 10 m, ≤ 25 m, 180° ; compteur remis à zéro à la mort
  T('5 séries : drone, gilet, sentinelle', async (t) => {
    const res = [];
    neuf(1);
    const p = await combat({ allies: 2, ennemis: 4 }), a = p.local, S = p.series;
    const E = ennemis(p), Es = ecouter(p, 'serie');
    // trois éliminations : le drone à prendre
    for (let k = 0; k < 3; k++) { tuer(p, E[k], { d: 8 + k * 2 }); jeu.avancer(4.5); }
    const K = S.de(0);
    res.push([`3 éliminations : série ${K.vie}, à prendre : ${K.dispo.join(',')}`, K.vie === 3 && egal(K.dispo, ['drone'])]);
    jeu.commande(0, { serie: 1 }, PAS); jeu.avancer(PAS * 2);
    p.majHud();
    const d0 = p.hud.series.drone, sig0 = p.hud.signalesMiniCarte.length;
    res.push([`drone lancé : ${r2(d0)} s, ${sig0} ennemis sur la mini-carte`, Math.abs(d0 - 25) < 0.05 && sig0 === E.filter((b) => b.vivant).length && sig0 > 0]);
    // les balayages : toutes les 2 s (la mini-carte garde le dernier)
    const D = S.drones[0], t0 = D.prochain;
    jeu.avancer(2.0); const t1 = D.prochain;
    res.push([`balayages espacés de ${r2(t1 - t0)} s`, Math.abs(t1 - t0 - 2) < 1e-9]);
    jeu.avancer(23.5); p.majHud();
    res.push([`après 25,5 s : drone ${p.hud.series.drone}, mini-carte ${p.hud.signalesMiniCarte.length}`, p.hud.series.drone === 0 && p.hud.signalesMiniCarte.length === 0 && Es.L.some((e) => e.id === 'drone' && e.etat === 'finie')]);
    // deux de plus : le gilet ; pris AVANT la vie
    for (let k = 0; k < 2; k++) { tuer(p, E[k], { d: 9 }); jeu.avancer(4.5); }
    jeu.commande(0, { serie: 2 }, PAS); jeu.avancer(PAS * 2);
    const ar0 = a.armure; p.infliger(a, 30, { par: E[2].id, arme: 'fa24', zone: 'torse' });
    // (relecture : les 30 dégâts pris par le gilet comptent à l'assistance du tireur — § 3.5 —, et le coup est une touche)
    const aide = (a._aides || []).filter((h) => h.par === E[2].id).reduce((s, h) => s + h.d, 0);
    res.push([`gilet : armure ${ar0} ; 30 dégâts → vie ${r2(a.vie)}, armure ${r2(a.armure)}, à l'assistance du tireur ${aide}`, ar0 === 60 && a.vie === 100 && a.armure === 30 && aide === 30]);
    p.infliger(a, 50, { par: E[2].id, arme: 'fa24', zone: 'torse' });
    res.push([`50 de plus : vie ${r2(a.vie)}, armure ${r2(a.armure)}`, a.vie === 80 && a.armure === 0]);
    // deux de plus : la sentinelle
    for (let k = 0; k < 2; k++) { tuer(p, E[k + 1], { d: 9 }); jeu.avancer(4.5); }
    jeu.commande(0, { serie: 3 }, PAS); jeu.avancer(PAS * 2);
    const s = S.sentinelles[0];
    res.push([`7 éliminations : sentinelle posée ${!!s}${s ? ` à ${r2(Math.hypot(s.x - a.pos.x, s.z - a.pos.z))} m, ${s.vie} PV, ${r2(s.fin - p.t)} s` : ''}`, !!s && s.vie === 300 && Math.abs(s.fin - p.t - 40) < 0.05]);
    // la mort : le compteur à zéro, les séries à prendre gardées
    S.de(0).dispo.push('gilet');
    p.infliger(a, 1e4, { par: E[3].id, arme: 'fa24', zone: 'torse' });
    res.push([`mort : série ${S.de(0).vie}, à prendre gardé : ${S.de(0).dispo.join(',')}`, S.de(0).vie === 0 && S.de(0).dispo.includes('gilet')]);
    jeu.avancer(3.5);
    res.push([`réapparu : armure ${a.armure}`, a.vivant && a.armure === 0]);
    // 40 s : la sentinelle s'en va
    if (s) s.cible = -1;
    jeu.avancer(40);
    res.push([`40 s plus tard : ${S.sentinelles.length} sentinelle`, S.sentinelles.length === 0 && Es.L.some((e) => e.id === 'sentinelle' && e.etat === 'finie')]);
    Es.fin();
    jeu.quitter('balade');
    // LA SENTINELLE QUI TIRE : posée sur la ligne du stand (la rue dégagée, vers les couloirs), un homme debout (increvable) à
    // `d` m, à `angles` degrés de son cap — la première place libre, au même sol, qu'elle VOIT (sauf `vue: false`) ; 25 % ± 5
    // de touches sur ≥ 300 balles à 10 m
    const tir = async (pose) => {
      const q = await combat({ allies: 0, ennemis: 1, graine: pose.graine || 21 }), cible = q.acteurParId(1), Sq = q.series, C = game.collisions;
      jeu.teleporter(0, STAND.ligne.x + 1, STAND.ligne.y, STAND.ligne.z, STAND.ligne.lacet); game.camPitch = 0;
      Sq.de(0).dispo.push('sentinelle'); jeu.commande(0, { serie: 3, lacet: STAND.ligne.lacet, tangage: 0 }, PAS); jeu.avancer(PAS * 2);
      const st = Sq.sentinelles[0]; if (!st) { jeu.quitter('balade'); return null; }
      st.fin = Infinity;
      cible.vie = cible.vieMax = 1e9; cible.armure = 0;
      let place = null;
      for (const d of pose.d) for (const ang of pose.angles) {
        if (place) break;
        const l = st.cap + ang * DEG, x = st.x - Math.sin(l) * d, z = st.z - Math.cos(l) * d, y = C.solEn(x, z, st.y + 0.3);
        if (pose.vue !== false && (Math.abs(y - st.y) > 0.3 || !C.libre(x, z, 0.3, y) || !q.balistique.vue(st.x, st.y + SERIES.sentinelle.oeil, st.z, x, y + 1.27, z))) continue;
        place = { x, y: pose.vue === false ? st.y : y, z, d, ang };
      }
      if (!place) { jeu.quitter('balade'); return { tirs: -1, touches: 0, place: null }; }
      // (hors de la rue bornée — à 26 m, la rue s'arrête : la cible n'y est pas ramenée)
      if (pose.vue === false && cible.joueur) cible.joueur.bounds = { xMin: -100, xMax: 100, zMin: -100, zMax: 100 };
      jeu.teleporter(1, place.x, place.y, place.z);
      jeu.teleporter(0, st.x + Math.sin(st.cap) * 2, st.y, st.z + Math.cos(st.cap) * 2);
      const T0 = ecouter(q, 'tir'), T1 = ecouter(q, 'touche');
      jeu.avancer(pose.duree || 50); T0.fin(); T1.fin();
      const tirs = T0.L.filter((e) => e.a === st.id).length, touches = T1.L.filter((e) => e.arme === 'sentinelle' && e.cible === 1).length;
      jeu.quitter('balade');
      return { tirs, touches, place };
    };
    // (trois graines — une balle sur quatre en moyenne, ± 3 points d'une graine à l'autre sur 240 balles —, les balles mises ensemble)
    const L10 = [];
    for (const graine of [21, 5, 77]) L10.push(await tir({ graine, d: [10], angles: [0, 4, -4, 8, -8, 12, -12, 16, -16] }));
    const a10 = L10.every((x) => x && x.tirs > 0) ? { tirs: L10.reduce((s, x) => s + x.tirs, 0), touches: L10.reduce((s, x) => s + x.touches, 0) } : null;
    const a26 = await tir({ d: [26], angles: [0], vue: false, duree: 6 }), dos = await tir({ d: [6], angles: [120], vue: false, duree: 6 });
    const cote = await tir({ d: [4, 3, 2.5], angles: [80, -80, 75, -75], duree: 8 });
    const k10 = a10 ? a10.touches / Math.max(1, a10.tirs) : 0;
    t.note('L-P sentinelle touches à 10 m', r3(k10));
    res.push([`sentinelle à 10 m : ${a10 && a10.touches} / ${a10 && a10.tirs} = ${Math.round(100 * k10)} % (25 ± 5 ; par graine ${L10.map((x) => x ? Math.round(100 * x.touches / Math.max(1, x.tirs)) : '-').join(' / ')} %)`,
      !!a10 && a10.tirs >= 300 && Math.abs(k10 - 0.25) <= 0.05]);
    res.push([`à 26 m : ${a26 && a26.tirs} tirs ; derrière (120°) : ${dos && dos.tirs} ; sur le côté (${cote && cote.place ? cote.place.ang + '°, ' + cote.place.d + ' m' : '—'}) : ${cote && cote.tirs}`,
      !!a26 && a26.tirs === 0 && dos.tirs === 0 && cote.tirs > 0]);
    // 300 PV : détruite par les balles d'un ennemi
    {
      const q = await combat({ allies: 0, ennemis: 1 }), Sq = q.series, b = q.acteurParId(1);
      jeu.teleporter(0, STAND.ligne.x + 1, STAND.ligne.y, STAND.ligne.z, STAND.ligne.lacet);
      Sq.de(0).dispo.push('sentinelle'); jeu.commande(0, { serie: 3, lacet: STAND.ligne.lacet, tangage: 0 }, PAS); jeu.avancer(PAS * 2);
      const st = Sq.sentinelles[0];
      b.arsenal = new Arsenal(b, CLASSES.assaut);
      // (l'ennemi à 6 m derrière elle, qui la vise et tire ; elle ne le voit pas — dos tourné)
      jeu.teleporter(1, st.x + Math.sin(st.cap) * 6, st.y, st.z + Math.cos(st.cap) * 6);
      jeu.teleporter(0, st.x - Math.sin(st.cap) * 20, st.y, st.z - Math.cos(st.cap) * 20);
      const Ed = ecouter(q, 'serie');
      jeu.tirer(1, { n: 30, cible: { x: st.x, y: st.y + 0.6, z: st.z } }); b.arsenal.remplir();
      jeu.tirer(1, { n: 30, cible: { x: st.x, y: st.y + 0.6, z: st.z } });
      Ed.fin();
      const det = Ed.L.find((e) => e.etat === 'detruite');
      res.push([`300 PV : détruite ${!!det} (${Ed.L.filter((e) => e.etat === 'touchee').length} touches)`, !!det && Sq.sentinelles.length === 0]);
      jeu.quitter('balade');
    }
    // (relecture) LA MI-TEMPS de la domination : les camps s'échangent, drone et sentinelle de la première moitié s'en vont
    {
      const q = await combat({ mode: 'domination', allies: 1, ennemis: 2 }), Sq = q.series, Ef = ecouter(q, 'serie');
      Sq.de(0).dispo.push('drone', 'sentinelle');
      jeu.commande(0, { serie: 1 }, PAS); jeu.avancer(PAS * 2); jeu.commande(0, { serie: 3 }, PAS); jeu.avancer(PAS * 2);
      const avant = [Sq.drones.length, Sq.sentinelles.length];
      q._miTemps(); jeu.avancer(PAS * 2); Ef.fin();
      res.push([`mi-temps : drones ${avant[0]} → ${Sq.drones.length}, sentinelles ${avant[1]} → ${Sq.sentinelles.length}`,
        avant[0] === 1 && Sq.drones.length === 0 && Sq.sentinelles.length === 0 && Ef.L.filter((e) => e.etat === 'finie').length >= 1 + (avant[1] ? 1 : 0)]);
      jeu.quitter('balade');
    }
    rendre();
    return bilan(res, 'drone 25 s, balayage 2 s ; gilet pris avant la vie ; sentinelle 40 s / 300 PV, 25 ± 5 % à 10 m, rien à 26 m ni derrière ; série à zéro à la mort');
  }, { delai: 240 });

  // 6. LES 16 MÉDAILLES provoquées une à une → leur XP et leur ligne exactes
  T('6 les 16 médailles, une à une', async (t) => {
    const res = [];
    const hab = () => (game.settings && game.settings.data && game.settings.data.jeu && game.settings.data.jeu.habillage === 'militaire' ? 'militaire' : 'airsoft');
    // une scène : la partie (bots figés), un premier sang donné à un allié (sauf pour lui), puis `jouer(p)` ; ce que l'on garde :
    // les médailles de Haythem, l'XP « médailles » du profil, les lignes du HUD
    const scene = async (id, jouer, o = {}) => {
      neuf(1);
      const p = await combat({ allies: 3, ennemis: 5, ...o });
      const M = ecouter(p, 'medaille');
      if (id !== 'premierSang') { const A = allies(p)[0], e = ennemis(p)[4]; tuer(p, e, { par: A.id, d: 6 }); jeu.avancer(0.2); }
      const x0 = p.aff.profil.courante ? (p.aff.profil.courante.lignes.get('medaille') || { xp: 0 }).xp : 0;
      await jouer(p);
      M.fin();
      const miens = M.L.filter((e) => e.a === 0).map((e) => e.id);
      const xp = (p.aff.profil.courante.lignes.get('medaille') || { xp: 0 }).xp - x0, att = miens.reduce((s, m) => s + MEDAILLES[m].xp, 0);
      const Md = MEDAILLES[id], nom = hab() === 'airsoft' && Md.nomA ? Md.nomA : Md.nom;
      const ligne = p.aff.hud._xp.some((x) => x.lib === nom && x.n === '+' + Md.xp) || p.aff.hud._medailles.some((x) => x.nom === nom) || (p.aff.hud._medaille && p.aff.hud._medaille.nom === nom);
      const vue = p.aff.hud._xp.some((x) => x.lib === nom && x.n === '+' + Md.xp);
      jeu.quitter('balade');
      res.push([`${Md.nom} : ${miens.join('+') || 'rien'} → +${xp} XP (attendu ${att}), ligne « +${Md.xp} ${nom} » ${vue}`, miens.includes(id) && xp === att && ligne && vue]);
    };
    await scene('premierSang', (p) => { tuer(p, ennemis(p)[0]); });
    await scene('tete', (p) => { tuer(p, ennemis(p)[0], { zone: 'tete' }); });
    await scene('double', (p) => { const E = ennemis(p); tuer(p, E[0]); jeu.avancer(1); tuer(p, E[1]); });
    await scene('triple', (p) => { const E = ennemis(p); tuer(p, E[0]); jeu.avancer(1); tuer(p, E[1]); jeu.avancer(1); tuer(p, E[2]); });
    await scene('furie', (p) => { const E = ennemis(p); tuer(p, E[0]); jeu.avancer(1); tuer(p, E[1]); jeu.avancer(1); tuer(p, E[2]); jeu.avancer(0.5); tuer(p, E[3], { d: 12 }); });
    await scene('vengeance', (p) => { const e = ennemis(p)[0]; p.infliger(p.local, 1e4, { par: e.id, arme: 'fa24', zone: 'torse' }); jeu.avancer(3.5); tuer(p, e); });
    await scene('sauvetage', (p) => { const e = ennemis(p)[0], A = allies(p)[1]; p.infliger(A, 10, { par: e.id, arme: 'fa24', zone: 'torse' }); jeu.avancer(0.5); tuer(p, e); });
    await scene('loin', (p) => { tuer(p, ennemis(p)[0], { d: 34 }); });
    await scene('boutPortant', (p) => { tuer(p, ennemis(p)[0], { d: 1.5 }); });
    await scene('couteau', (p) => { tuer(p, ennemis(p)[0], { d: 1.4, arme: 'couteau' }); });
    await scene('serie5', (p) => { const E = ennemis(p); for (let k = 0; k < 5; k++) { tuer(p, E[k % 3]); jeu.avancer(4.6); } });
    await scene('serie10', (p) => { const E = ennemis(p); for (let k = 0; k < 10; k++) { tuer(p, E[k % 3]); jeu.avancer(4.6); } });
    await scene('troubleFete', (p) => { const e = ennemis(p)[0], A = allies(p); for (let k = 0; k < 3; k++) { tuer(p, A[k], { par: e.id, d: 6 }); jeu.avancer(0.3); } tuer(p, e); });
    // la domination : A pris seul (8 s), une élimination sur lui (défense), un point adverse neutralisé (4 s)
    const dom = async (id) => scene(id, async (p) => {
      const P0 = p.points[0];
      if (id === 'neutralisation') { P0.possesseur = 'B'; P0.capture = { equipe: null, k: 0 }; if (p.local.equipe === 'B') P0.possesseur = 'A'; }
      jeu.teleporter(0, P0.x, P0.y, P0.z);
      jeu.avancer(id === 'neutralisation' ? 4.3 : 8.3);
      if (id === 'defense') { const e = ennemis(p)[0]; tuer(p, e, { d: 2.5 }); }
    }, { mode: 'domination' });
    await dom('capture'); await dom('defense'); await dom('neutralisation');
    neuf(1);
    t.note('L-P médailles', res.filter((x) => x[1]).length);
    return bilan(res, 'les 16 médailles : chacune son événement, son XP au profil, sa ligne « +XP » au HUD');
  }, { delai: 240 });

  // 7. LE PROFIL enregistré puis relu identique ; un stockage qui lève → le jeu tourne, profil en mémoire ; jamais d'écriture de
  //    iris.settings.v1
  T('7 profil : enregistré, relu, stockage qui lève, jamais les réglages', async () => {
    const res = [];
    const S = stockageMemoire(); Profil.utiliserStockage(S);
    const D = profil.reinitialiser({ xp: 23456, medailles: { double: 3, loin: 1 }, ors: { pm9: true }, totaux: { elims: 321, morts: 120, tirs: 9000, touches: 3000, parties: 12, victoires: 7 },
      classes: [{ nom: 'FURTIF', principale: 'pm9', accessoire: 'silencieux', secondaire: 'p17', letale: null, tactique: 'flash2', atout: 'pasFeutres', camo: 'or' }] });
    profil.defisDuJour('2026-10-24');
    profil.enregistrer();
    const txt = S.getItem(PROFIL_CLE);
    Profil.utiliserStockage(S);
    const relu = new Profil().donnees;
    res.push([`relu identique (${txt ? txt.length : 0} octets, niveau ${niveauDe(relu.xp)})`, !!txt && egal(relu, JSON.parse(JSON.stringify(D))) && relu.classes[0].nom === 'FURTIF' && relu.ors.pm9 === true]);
    // une sauvegarde abîmée : remise d'aplomb
    S.setItem(PROFIL_CLE, '{"xp":"abc","armes":{"fa24":{"elims":-4}},"classes":[{"principale":"bazooka"}],"defis":7}');
    Profil.utiliserStockage(S);
    const ab = new Profil().donnees;
    res.push([`sauvegarde abîmée : xp ${ab.xp}, élim. ${ab.armes.fa24.elims}, classe ${ab.classes[0].principale}`, ab.xp === 0 && ab.armes.fa24.elims === 0 && ab.classes[0].principale === 'fa24']);
    // UN STOCKAGE QUI LÈVE : une partie entière, de l'XP, pas d'exception
    Profil.utiliserStockage({ getItem() { throw new Error('quota'); }, setItem() { throw new Error('quota'); }, removeItem() { throw new Error('quota'); } });
    const Pm = new Profil(), d0 = Pm.donnees;
    // (sous ?test=1, un profil sans données est le profil de test du niveau 40 : neuf quand même — aucune partie, aucune stat ;
    // regardé AVANT la partie, qui va l'enrichir)
    const fraisLu = d0.totaux.parties === 0 && d0.totaux.elims === 0 && d0.xp === xpPourNiveau(40);
    let err = null, xp = 0;
    try {
      const p = await combat({ allies: 1, ennemis: 2 });
      tuer(p, ennemis(p)[0]); jeu.avancer(1);
      xp = p.aff.profil.xp;
      p.evt('fin', { gagnant: p.local.equipe });
      jeu.quitter('balade');
    } catch (e) { err = String(e); }
    res.push([`stockage qui lève : profil neuf ${fraisLu}, en mémoire ${Pm.memoire}, +${xp - xpPourNiveau(40)} XP gagnés, ${err || 'aucune exception'}`, fraisLu && Pm.memoire && xp - xpPourNiveau(40) >= 100 && !err && Pm.enregistrer() === false]);
    // JAMAIS iris.settings.v1 (ni le profil réel de cette origine sous ?test=1)
    Profil.utiliserStockage(stockageMemoire());
    const ecrits = [], f = Storage.prototype.setItem, reel0 = (() => { try { return localStorage.getItem(PROFIL_CLE); } catch (e) { return null; } })();
    Storage.prototype.setItem = function (k, v) { ecrits.push(k); return f.call(this, k, v); };
    try {
      profil.reinitialiser({ xp: 1000 }); profil.ajouterXp(5000, 'test'); profil.enregistrer(); profil.poserClasse('perso1', { nom: 'X', principale: 'fa24' });
      const p = await combat({ allies: 1, ennemis: 1 }); tuer(p, ennemis(p)[0]); p.evt('fin', { gagnant: p.local.equipe }); jeu.quitter('balade');
    } finally { Storage.prototype.setItem = f; }
    const reel1 = (() => { try { return localStorage.getItem(PROFIL_CLE); } catch (e) { return null; } })();
    res.push([`écritures du navigateur pendant le profil : ${ecrits.length ? ecrits.join(', ') : 'aucune'} ; profil réel de l'origine intact ${reel0 === reel1}`, !ecrits.includes('iris.settings.v1') && !ecrits.includes(PROFIL_CLE) && reel0 === reel1]);
    // les défis du jour : tirés à la date (les mêmes deux fois, d'autres le lendemain), trois, une arme débloquée
    const a1 = tirerDefis('2026-10-24', 1), a2 = tirerDefis('2026-10-24', 1), b1 = tirerDefis('2026-10-25', 1);
    res.push([`défis du 24/10 : ${a1.map((d) => d.texte).join(' · ')} ; le 25/10 différents ${!egal(a1, b1)}`, a1.length === 3 && egal(a1, a2) && !egal(a1.map((d) => d.id), b1.map((d) => d.id)) && a1.every((d) => !d.arme || niveauRequis('arme', d.arme) <= 1)]);
    rendre();
    return bilan(res, 'relu identique ; abîmé remis d’aplomb ; stockage qui lève : partie jouée, profil en mémoire ; jamais iris.settings.v1');
  }, { delai: 120 });

  // 8. LES ARMES AU SOL : lâchée à la mort d'un bot, ramassée par F (`ramasser` vrai, munitions reprises), disparue à 30 s,
  //    10 au plus ; ≤ 3 appels chacune
  T('8 armes au sol', async () => {
    const res = [];
    neuf(1);
    const p = await combat({ allies: 0, ennemis: 4 }), a = p.local, G = p.armesSol, e = ennemis(p)[0];
    e.arsenal = new Arsenal(e, CLASSES.infiltration); e._fiches = e.arsenal.armes.slice(); e.arsenal.ch[0] = 17; e.arsenal.res[0] = 64;
    tuer(p, e, { d: 0.8 });
    const s = G.liste[0];
    res.push([`à la mort : ${s ? `${s.arme} ${s.ch} / ${s.res} à ${r2(Math.hypot(s.x - a.pos.x, s.z - a.pos.z))} m` : 'rien'}`, !!s && s.arme === 'pm9' && s.ch === 17 && s.res === 64]);
    p.majHud();
    res.push([`HUD : ramasser ${p.hud.ramassage && p.hud.ramassage.arme}`, !!p.hud.ramassage && p.hud.ramassage.arme === 'pm9']);
    // F : l'échange (l'arme en main tombe à sa place)
    const ok = G.ramasser(a, G.proche(a));
    const A = a.arsenal;
    res.push([`ramasser → ${ok} : en main ${A.arme.id} ${A.chargeur} / ${A.reserve} ; au sol ${G.liste.map((x) => x.arme + ' ' + x.ch + '/' + x.res).join(', ')}`,
      ok === true && A.arme.id === 'pm9' && A.chargeur === 17 && A.reserve === 64 && G.liste.length === 1 && G.liste[0].arme === 'fa24' && G.liste[0].ch === 30]);
    jeu.avancer(0.5);
    // par la commande : F (`interagir`) reprend la FA-24
    jeu.commande(0, { interagir: true }, PAS * 2); jeu.avancer(PAS * 3); jeu.commande(0, { interagir: false }, PAS); jeu.avancer(PAS * 2);
    res.push([`F : en main ${A.arme.id}, au sol ${G.liste.map((x) => x.arme).join(', ')}`, A.arme.id === 'fa24' && G.liste.length === 1 && G.liste[0].arme === 'pm9']);
    // deux appuis sur RECHARGER : l'échange aussi (la manette, le doigt)
    jeu.avancer(0.5);
    jeu.commande(0, { recharger: true }, PAS); jeu.avancer(PAS * 4); jeu.commande(0, { recharger: true }, PAS); jeu.avancer(PAS * 3);
    res.push([`2 × RECHARGER : en main ${A.arme.id}`, A.arme.id === 'pm9']);
    // les munitions prises en passant sur une arme du même modèle
    A.res[A.i] = 10; const s2 = G.poser(ARMES.pm9, 20, 30, a.pos.x + 0.3, a.pos.y, a.pos.z, 0, 99);
    jeu.avancer(PAS * 2);
    res.push([`munitions : réserve 10 → ${A.reserve} (une PM-9 au sol 20 + 30)`, A.reserve === 60 && !G.liste.includes(s2)]);
    // la réapparition rend la dotation
    p.infliger(a, 1e4, { par: ennemis(p)[1].id, arme: 'fa24', zone: 'torse' }); jeu.avancer(3.5);
    res.push([`réapparu : ${a.arsenal.armes.map((f) => f.id).join(' + ')}`, a.vivant && a.arsenal.armes[0].id === 'fa24']);
    // 30 s ; 10 au plus
    const n0 = G.liste.length; jeu.avancer(31);
    res.push([`30 s : ${n0} → ${G.liste.length}`, n0 > 0 && G.liste.length === 0]);
    for (let k = 0; k < 13; k++) G.poser(ARMES.fp12, 7, 21, a.pos.x + k, a.pos.y, a.pos.z + 3, 0);
    res.push([`13 posées : ${G.liste.length} gardées (les plus récentes)`, G.liste.length === REGLES_SOL.max && G.liste[0].id === G.n - 10]);
    // L'AFFICHAGE : un modèle de L-W par arme posée, couché, ≤ 3 appels, ni ombre portée ni ombre de contact
    await jeu.images(2);
    const Ap = p.aff.progression, grp = [...Ap.sol.values()];
    const app = grp.map((g) => AffProgression.appelsArme(g)), ombre = grp.some((g) => { let o = false; g.traverse((m) => { if (m.isMesh && m.castShadow) o = true; }); return o; });
    res.push([`${grp.length} modèles, appels ${[...new Set(app)].join('/')} chacun, ombre portée ${ombre}, racine ${Ap.rSol.userData.dynamique && Ap.rSol.userData.horsContact}`,
      grp.length === 10 && app.every((x) => x <= 3) && !ombre && Ap.rSol.parent === game.scene && Ap.rSol.userData.dynamique]);
    // le compte RÉEL : une arme à 4 m devant la caméra, puis plus rien
    G.liste.length = 0; await jeu.images(2);
    jeu.figerQualite(true);
    try {
      await jeu.qualite('moyenne');
      const q = devant(p, 4); game.camPitch = 0.3;
      await jeu.images(4); const sans = (await jeu.images(6)).appels;
      G.poser(ARMES.fa24, 30, 90, q.x, q.y, q.z, a.cmd.lacet);
      await jeu.images(4); const avec = (await jeu.images(6)).appels;
      res.push([`appels : ${sans} → ${avec} avec une FA-24 au sol devant (≤ 3 de plus)`, avec - sans <= 3 && avec - sans >= 1]);
    } finally { jeu.figerQualite(false); }
    jeu.quitter('balade');
    // (relecture) une partie neuve : l'arme proposée est une arme qu'on peut PRENDRE (une FA-24 au sol, réserve pleine, ne cache
    // pas la PM-9 d'à côté) ; F ne prend rien pendant qu'une frag cuit en main ; au doigt, l'invite touchée ramasse
    {
      const q = await combat({ allies: 0, ennemis: 1 }), b = q.local, Gq = q.armesSol, Aq = b.arsenal;
      Gq.poser(ARMES.fa24, 30, 90, b.pos.x + 0.3, b.pos.y, b.pos.z, 0, 97); Gq.poser(ARMES.pm9, 32, 96, b.pos.x + 1.0, b.pos.y, b.pos.z, 0, 96);
      jeu.avancer(PAS * 2); q.majHud();
      const pr = Gq.proche(b), inv = q.hud.ramassage;
      res.push([`une FA-24 au sol à 0,3 m (déjà tenue), une PM-9 à 1 m : proposée ${pr && pr.arme}, invite ${inv && inv.arme}`, !!pr && pr.arme === 'pm9' && !!inv && inv.arme === 'pm9']);
      const tactile = document.body.classList.contains('touch'), el = q.aff.hud.eRamasse;
      document.body.classList.add('touch');
      try {
        q.majHud(); await jeu.images(2);
        el.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'touch', bubbles: true, cancelable: true }));
        jeu.avancer(PAS * 3);
        await new Promise((r) => setTimeout(r, 200)); jeu.avancer(PAS * 2);
      } finally { if (!tactile) document.body.classList.remove('touch'); }
      res.push([`au doigt, l'invite touchée : en main ${Aq.arme.id}`, Aq.arme.id === 'pm9']);
      // (la FA-24 est retombée là : une frag cuite en main, F ne la prend pas — la partie quittée grenade en main)
      jeu.avancer(0.6);
      jeu.commande(0, { letale: true }, 1); jeu.avancer(0.3);
      const et = Aq.etatArme, let0 = Aq.letales, vise = Gq.proche(b);
      jeu.commande(0, { interagir: true }, PAS * 3); jeu.avancer(PAS * 3);
      res.push([`frag cuite en main (${et}, ${let0} grenade) près d'une ${vise && vise.arme} : F → en main ${Aq.arme.id}, ${Aq.etatArme}`,
        et === 'lancer' && !!vise && vise.arme === 'fa24' && Aq.arme.id === 'pm9' && Aq.etatArme === 'lancer']);
      jeu.quitter('balade');
    }
    return bilan(res, 'lâchée à la mort, ramassée par F (et 2 × RECHARGER), munitions prises, dotation rendue, 30 s, 10 au plus ; ≤ 3 appels');
  }, { delai: 120 });

  // 9. L'ARMURERIE ET LE PROFIL navigables à la manette ; l'arme qui tourne par vitrine(id) dans la scène de l'arme de vue
  //    (0 lumière ajoutée à la scène de jeu)
  T('9 armurerie et profil à la manette, vitrine', async () => {
    const res = [];
    neuf(16);
    jeu.quitter('menu'); for (let i = 0; i < 3; i++) game.frame(1 / 60);
    const M = MENUS.courant, nav = () => game.input.manette.nav;
    const pad = (nom) => {
      const N = nav(), r = N.racine(); if (!r) return null;
      const bas = PAD_BOUTONS.map(() => false), g0 = { x: 0, y: 0, m: 0, brut: 0 }, d0 = { x: 0, y: 0, m: 0 };
      bas[I[nom]] = true;
      N.traiter(r, bas, ['Up', 'Down', 'Left', 'Right'].includes(nom) ? [] : [I[nom]], g0, d0, 1 / 60);
      const r2b = N.racine(); if (r2b) N.traiter(r2b, PAD_BOUTONS.map(() => false), [], g0, d0, 1 / 60);
      return N.cur;
    };
    const focus = () => { const N = nav(), r = N.racine(); if (r) N.verifier(r); return N.cur; };
    const lumieres = () => { let n = 0; game.scene.traverse((o) => { if (o.isLight) n++; }); return n; };
    const l0 = lumieres(), sup0 = game.fx.superpositions.length;
    const portes = [...document.querySelectorAll('#menu-jeu .mj-b')].map((b) => b.dataset.act), prog = [...document.querySelectorAll('#menu-jeu .mj-tete .mj-p')].map((b) => b.dataset.act);
    res.push([`accueil : ${portes.join(' · ')} ; sous le titre : ${prog.join(' · ')}`, egal(portes, ['balade', 'combat', 'prophunt', 'stand', 'options', 'credits']) && egal(prog, ['armurerie', 'profil'])]);
    // (la croix : ARMURERIE en montant depuis BALADE LIBRE)
    {
      const a0 = entree.manette; entree.manette = true;
      try { focus(); nav().poser(document.querySelector('#menu-jeu [data-act="balade"]')); const h1 = pad('Up'), a1 = h1 && h1.dataset.act, h2 = h1 && pad(a1 === 'profil' ? 'Left' : 'Right');
        res.push([`↑ depuis BALADE : ${a1}, puis ${h2 && h2.dataset.act}`, (a1 === 'armurerie' || a1 === 'profil') && !!h2 && h2.dataset.act === (a1 === 'profil' ? 'armurerie' : 'profil')]); }
      finally { entree.manette = a0; nav().poser(null); nav().cle = null; }
    }
    const barre = document.querySelector('#menu-jeu .mj-xp');
    res.push([`barre d'XP sous le titre : « ${barre && barre.textContent.replace(/\s+/g, ' ').trim()} »`, vu(barre) && /16/.test(barre.textContent)]);
    const a = entree.manette; entree.manette = true;
    try {
      focus();
      nav().poser(document.querySelector('#menu-jeu [data-act="armurerie"]')); pad('A');
      const arm = document.getElementById('armurerie-jeu');
      const f0 = focus();
      res.push([`A sur ARMURERIE : ouverte ${vu(arm)}, focus ${f0 && f0.dataset.classe}`, vu(arm) && !!f0 && f0.classList.contains('ar-classe')]);
      // la croix descend dans les classes, A en choisit une
      const c1 = pad('Down'); pad('A'); const sel1 = M.prog.sel;
      res.push([`↓ puis A : classe ${sel1} (focus ${c1 && c1.dataset.classe})`, !!c1 && sel1 === c1.dataset.classe && sel1 !== 'assaut']);
      // la vitrine : l'arme principale de la classe, dans la scène de l'arme de vue, superposée
      const vm = game.depsJeu.affichage.viewmodel;
      let k = 0; while (!(vm._pret && vm._vitrine) && k++ < 150) await new Promise((r) => setTimeout(r, 100));
      const E = M.profil.equipement(sel1);
      res.push([`vitrine : ${vm._vitrine} (attendu ${E.principale}), superposée ${game.fx.superpositions.some((s) => s.scene === vm.scene)}, vue décalée ${!!(vm.camera.view && vm.camera.view.enabled)}`,
        vm._vitrine === E.principale && game.fx.superpositions.some((s) => s.scene === vm.scene) && !!(vm.camera.view && vm.camera.view.enabled)]);
      // une classe personnalisée : la croix jusqu'à un accessoire, A le pose
      M.prog.sel = 'perso1'; M.prog._rendreArmurerie();
      nav().poser(document.querySelector('#armurerie-jeu [data-champ="accessoire"][data-v=\'"poignee"\']')); pad('A');
      res.push([`perso 1 : poignée posée ${M.profil.classePerso('perso1').accessoire}`, M.profil.classePerso('perso1').accessoire === 'poignee']);
      nav().poser(document.querySelector('#armurerie-jeu [data-act="prendre"]')); pad('A');
      res.push([`PRENDRE : jeu.combat.classe = ${M._valeur('jeu.combat.classe')}`, M._valeur('jeu.combat.classe') === 'perso1']);
      await jeu.images(3);
      res.push([`lumières de la scène de jeu : ${l0} → ${lumieres()}`, lumieres() === l0]);
      pad('B');
      res.push([`B : accueil ${vu(document.getElementById('menu-jeu'))}, vitrine retirée ${!vm._vitrine && game.fx.superpositions.length === sup0}, vue rendue ${!(vm.camera.view && vm.camera.view.enabled)}`,
        vu(document.getElementById('menu-jeu')) && !vu(arm) && !vm._vitrine && game.fx.superpositions.length === sup0 && !(vm.camera.view && vm.camera.view.enabled)]);
      // LE PROFIL
      nav().poser(document.querySelector('#menu-jeu [data-act="profil"]')); pad('A');
      const pf = document.getElementById('profil-jeu'), txt = pf.textContent;
      res.push([`A sur PROFIL : ouvert ${vu(pf)}, niveau, défis, armes, médailles, déblocages`, vu(pf) && /DÉFIS DU JOUR/.test(txt) && /PAR ARME/.test(txt) && /MÉDAILLES/.test(txt) && /DÉBLOCAGES/.test(txt) && /NIVEAU/.test(txt)]);
      pad('B');
      res.push([`B : accueil ${vu(document.getElementById('menu-jeu'))}`, vu(document.getElementById('menu-jeu')) && !vu(pf)]);
    } finally { entree.manette = a; nav().poser(null); nav().cle = null; M._poser('jeu.combat.classe', 'assaut'); }
    rendre();
    return bilan(res, 'huit portes ; ARMURERIE et PROFIL ouverts par A, parcourus à la croix, refermés par B ; vitrine dans la scène de l’arme, aucune lumière ajoutée');
  }, { delai: 90 });

  // 10. LES SEUILS DE L-G toujours tenus (≤ 2 écritures DOM par image) ; verifierDeterminisme égal séries actives ;
  //     verifierEtat() vrai (champ `serie` des acteurs)
  T('10 HUD ≤ 2 écritures par image, déterminisme et état, séries actives', async (t) => {
    const res = [];
    neuf(40);
    // (a) 300 images de manche à 7 bots, Haythem avec ses trois séries lancées, des médailles qui tombent
    await jeu.lancer('equipes', { graine: 11, zone: 'ss', allies: 3, ennemis: 4, equipement: equipe({ accessoire: 'poignee', atout: 'endurance' }) });
    let p = game.partie;
    jeu.avancer(6.2); game.paused = false;
    p.series.de(0).dispo.push('drone', 'gilet', 'sentinelle');
    for (const k of [1, 2, 3]) { jeu.commande(0, { serie: k }, PAS); jeu.avancer(PAS * 2); }
    for (let i = 0; i < 20; i++) game.frame(1 / 60);
    const mo = new MutationObserver(() => {});
    mo.observe(document.getElementById('hud'), { subtree: true, attributes: true, childList: true, characterData: true });
    let records = 0;
    try {
      for (let i = 0; i < 300; i++) {
        if (i % 75 === 10) { const e = ennemis(p).find((b) => b.vivant); if (e) tuer(p, e, { d: 9 }); }
        game.camYaw += 0.012; game.frame(1 / 60); records += mo.takeRecords().length;
      }
    } finally { mo.disconnect(); }
    const parImage = records / 300;
    t.note('L-P écritures du HUD par image', r2(parImage));
    res.push([`${r2(parImage)} écriture(s) DOM par image (≤ 2), ${p.aff.hud.medaillesVues} médailles montrées, séries ${p.series.drones.length} drone / ${p.series.sentinelles.length} sentinelle`,
      parImage <= 2 && p.aff.hud.medaillesVues >= 1 && p.series.sentinelles.length === 1]);
    jeu.quitter('balade');
    // (b) MÊME GRAINE → MÊME PARTIE, séries actives (les bots tirent leurs drones ; Haythem lance les siennes, pose une arme)
    const une = async () => {
      await jeu.lancer('equipes', { graine: 42, zone: 'ecole', allies: 3, ennemis: 4, difficulte: 'aguerri', equipement: equipe({ accessoire: 'silencieux', atout: 'endurance' }) });
      const q = game.partie; jeu.harnais.figerDegrade = true; q.degrade = false;
      jeu.avancer(7);
      q.series.de(0).dispo.push('drone', 'gilet', 'sentinelle');
      for (const k of [1, 2, 3]) { jeu.commande(0, { serie: k }, PAS); jeu.avancer(PAS * 2); }
      for (const b of q.acteurs.filter((x) => !x.local).slice(0, 3)) q.series.de(b.id).dispo.push('drone');
      for (const b of q.acteurs.filter((x) => !x.local).slice(0, 3)) q.series.lancer(b, 'drone');
      jeu.avancer(30);
      const e = q.empreinte(), n = { drones: q.series.drones.length, sol: q.armesSol.liste.length, med: q.evenements.filter((x) => x.type === 'medaille').length };
      jeu.quitter('balade');
      return { e, n };
    };
    let A1, A2;
    try { A1 = await une(); A2 = await une(); } finally { jeu.harnais.figerDegrade = false; }
    res.push([`déterminisme (graine 42, 37 s, séries actives : ${A1.n.drones} drones, ${A1.n.sol} armes au sol) : ${A1.e} / ${A2.e}`, A1.e === A2.e && egal(A1.n, A2.n)]);
    // (c) L'ÉTAT : etat() → appliquer() dans une partie neuve → etat() identique, en pleine série
    const o = { graine: 9, zone: 'ecole', allies: 2, ennemis: 3, equipement: equipe({ accessoire: 'chargeur', atout: 'mainSure' }) };
    await jeu.lancer('equipes', o); p = game.partie; jeu.avancer(7);
    p.series.de(0).dispo.push('drone', 'sentinelle'); jeu.commande(0, { serie: 1 }, PAS); jeu.avancer(PAS * 2); jeu.commande(0, { serie: 3 }, PAS); jeu.avancer(PAS * 2);
    tuer(p, ennemis(p)[0], { d: 3 }); tuer(p, ennemis(p)[1], { d: 5 }); p.series.de(0).dispo.push('gilet');
    jeu.avancer(2.5);
    const e1 = p.etat();
    jeu.quitter('balade');
    await jeu.lancer('equipes', o); p = game.partie;
    p.appliquer(JSON.parse(JSON.stringify(e1)));
    const e2 = p.etat();
    jeu.quitter('balade');
    const avecSerie = e1.acteurs.find((s) => s.id === 0).serie;
    res.push([`état en pleine série : ${hacher(e1, 1e-9)} / ${hacher(e2, 1e-9)} ; serie de Haythem ${JSON.stringify(avecSerie)}, sentinelles ${e1.prog.series.sent.length}, armes au sol ${e1.prog.sol.liste.length}`,
      hacher(e1, 1e-9) === hacher(e2, 1e-9) && !!avecSerie && e1.prog.series.sent.length === 1 && e1.prog.sol.liste.length >= 1]);
    const v = await jeu.verifierEtat({ mode: 'equipes', zone: 'ecole', allies: 2, ennemis: 3, secondes: 9 });
    res.push([`verifierEtat (équipes, 9 s) ${v}`, v === true]);
    rendre();
    return bilan(res, '≤ 2 écritures DOM par image séries actives ; déterminisme égal ; état identique (serie, sentinelles, armes au sol)');
  }, { delai: 240 });

  // 11. PURETÉ : series.js et armes_au_sol.js n'importent aucun module d'affichage ; les maillages des armes au sol, de la
  //     sentinelle et du drone sont créés par aff_progression.js seul (racines de scène, `dynamique`, compilés à la préparation :
  //     programmes constants)
  T('11 pureté, racines, programmes constants', async () => {
    const res = [];
    const permis = new Set(['./armes.js', './rng.js', './series.js', './constantes.js']);
    for (const f of ['series.js', 'armes_au_sol.js']) {
      const src = await fetch(new URL('../' + f, import.meta.url), { cache: 'no-cache' }).then((r) => r.text());
      const imp = [...src.matchAll(/^\s*import\s[^'"]*['"]([^'"]+)['"]/gm)].map((m) => m[1]);
      const fautes = /Math\.random|performance\.now|Date\.now|Raycaster|DecalGeometry|Light\(|\.input\.|document\.|window\./.test(src.replace(/\/\/.*$/gm, ''));
      res.push([`${f} importe ${imp.join(', ')} ; ni hasard, horloge, entrées ni DOM ${!fautes}`, imp.every((x) => permis.has(x)) && !fautes]);
    }
    neuf(40);
    jeu.figerQualite(true);
    try {
      await jeu.qualite('moyenne');
      await jeu.lancer('equipes', { graine: 13, zone: 'ecole', allies: 2, ennemis: 3, equipement: equipe({ camo: 'or' }) });
      const p = game.partie; jeu.avancer(6.2); game.paused = false;
      await jeu.images(20);
      const p0 = game.renderer.info.programs.length;
      // tout ce qui se voit : une sentinelle qui tire, le drone, des armes au sol, une médaille
      p.series.de(0).dispo.push('drone', 'sentinelle');
      jeu.commande(0, { serie: 1 }, PAS); jeu.avancer(PAS * 2); jeu.commande(0, { serie: 3 }, PAS); jeu.avancer(PAS * 2);
      const st = p.series.sentinelles[0], e = ennemis(p)[0]; e.vie = e.vieMax = 1e9;
      if (st) jeu.teleporter(e.id, st.x - Math.sin(st.cap) * 8, st.y, st.z - Math.cos(st.cap) * 8);
      for (let k = 0; k < 4; k++) p.armesSol.poser(ARMES[['fa24', 'pm9', 'fp12', 'tp50'][k]], 5, 5, p.local.pos.x + 1 + k * 0.6, p.local.pos.y, p.local.pos.z - 2, k);
      tuer(p, ennemis(p)[1], { d: 6 });
      for (let k = 0; k < 20; k++) { game.camYaw += 0.15; await jeu.images(6); }
      const p1 = game.renderer.info.programs.length;
      const Ap = p.aff.progression, racines = [Ap.rSol, Ap.rSent, Ap.rDrone];
      const sous = (o) => { for (let q = o; q; q = q.parent) if (racines.includes(q)) return true; return false; };
      let horsRacine = 0; game.scene.traverse((o) => { if (/^(arme au sol|sentinelle|drone)/.test(o.name || '') && !sous(o)) horsRacine++; });
      const okR = racines.every((r) => r.parent === game.scene && r.userData.dynamique && r.userData.horsContact);
      res.push([`programmes ${p0} → ${p1} (sentinelle qui tire ${Ap.stats.sentinelles}, drone ${Ap.stats.drone}, armes au sol ${Ap.stats.solVus}, camouflage or sur l'arme de vue)`, p0 === p1 && Ap.stats.sentinelles === 1 && Ap.stats.drone && Ap.stats.solVus >= 4]);
      res.push([`racines : 3 enfants directs de la scène, dynamiques, hors des ombres de contact ${okR} ; maillages hors racine ${horsRacine}`, okR && horsRacine === 0]);
      jeu.quitter('balade');
    } finally { jeu.figerQualite(false); }
    rendre();
    return bilan(res, 'series.js et armes_au_sol.js purs ; tout ce qui se voit sous les racines d’aff_progression ; programmes constants');
  }, { delai: 120 });

  // À L'INTÉGRATION (avec le vrai cerveau de L-J) : un bot à 5 m derrière Haythem qui court l'entend, plus avec Pas feutrés
  T('F · Pas feutrés, oreille du vrai cerveau (L-J)', async () => {
    const oreille = async (atout) => {
      neuf(40);
      const p = await combat({ equipement: equipe({ atout }), allies: 0, ennemis: 1 }, { vivants: [1] }), b = p.acteurParId(1);
      b.gele = true; if (b.arsenal) b.arsenal.bloque = true;
      const l = p.local.cmd.lacet; jeu.teleporter(1, p.local.pos.x + Math.sin(l) * 5, p.local.pos.y, p.local.pos.z + Math.cos(l) * 5, l);
      const i0 = (b.cerveau.indices || []).length;
      jeu.commande(0, { ay: 1, amp: 1 }, 1.5); jeu.avancer(1.5);
      const r = (b.cerveau.indices || []).length > i0 || (b.cerveau.etat && b.cerveau.etat !== 'patrouille');
      jeu.quitter('balade');
      return r;
    };
    const a = await oreille(null), f = await oreille('pasFeutres');
    neuf(1);
    return { ok: a && !f, attendu: 'entendu à 5 m en courant (9 m), pas avec Pas feutrés (3 m)', obtenu: `sans : ${a}, avec : ${f}` };
  }, { apresFusion: true, delai: 60 });
}
