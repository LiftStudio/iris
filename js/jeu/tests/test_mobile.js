// =====================================================================
//  LES TESTS DU LOT L-I — tactile, manette, aide à la visée (23/10/2026 ; spec § 5.5.13, critères 1 à 13 ; à F2 : les
//  vrais écrans de L-U, les vrais bustes de L-A, la vraie glissade de L-B, la roue dessinée par L-G)
// =====================================================================
// Lancés par le harnais sous `?test=1&rapport=1&lot=L-I` (window.__rapport), sur PC ET sous `?tel=1` (émulation mobile du
// navigateur). Les tests ne cliquent jamais à l'écran : tout passe par window.__jeu, par des événements de pointeur
// FABRIQUÉS (un doigt : PointerEvent pointerType 'touch' envoyé au bouton, au terrain ou à la fenêtre — le chemin de
// js/touch.js, sans en contourner une ligne) et par une MANETTE SIMULÉE (la disposition « standard », branchée à la place
// de navigator.getGamepads par `pads`, ses vibrations comptées). Sur un PC sans écran tactile (pas de js/touch.js), les
// parties « au doigt » sont jouées sous `?tel=1` ; l'aide à la visée, elle, se teste partout (le doigt y est alors simulé
// pour elle seule). Un test rend { ok, attendu, obtenu }.
import * as THREE from 'three';
import { PAS } from '../constantes.js';
import { settings, entree, PAD_BOUTONS } from '../../settings.js';
import { TouchControls, disposition, CONTEXTES_JEU, TACTILE_JEU } from '../../touch.js';
import { STICK_JEU, VIBRATIONS_JEU, courbe } from '../../manette.js';
import { AIDE, facteurStick, etatAide } from '../assistance_visee.js';
import { ajouterRacine, racinesInscrites } from '../../manette_menus.js';
import { capsules } from '../touches.js';
import { versTableau } from '../commande.js';

const DEG = Math.PI / 180;
const egal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const r3 = (v) => Math.round(v * 1000) / 1000;
const pres = (a, b, tol) => Math.abs(a - b) <= tol;
const enrouler = (a) => a - 2 * Math.PI * Math.round(a / (2 * Math.PI));
// le verdict d'une liste de [nom, vrai, détail]
function rendre(res) {
  const ko = res.filter((r) => !r[1]);
  const dire = (r) => r[0] + (r[2] !== undefined && r[2] !== '' ? ' (' + r[2] + ')' : '');
  return { ok: ko.length === 0, attendu: res.map((r) => r[0]).join(' · '), obtenu: ko.length ? 'faux : ' + ko.map(dire).join(' · ') : res.map(dire).join(' · ') };
}
const SANS_TACTILE = (quoi) => ({ ok: true, attendu: quoi, obtenu: 'PC sans écran tactile (pas de js/touch.js) : joué sous ?tel=1' });

export default function (jeu) {
  const game = window.__game;
  const T = (nom, fn, o) => jeu.ajouterTest('L-I', nom, fn, o);
  const TC = () => window.__touch || null;
  const canvas = () => game.renderer.domElement;

  // ---- UN DOIGT : posé sur un élément (le bouton, le terrain), il glisse et se lève sur la fenêtre (js/touch.js) ----
  let PID = 7000;
  function doigt(el, x, y) {
    const id = ++PID;
    const ev = (type, X, Y, cible) => (cible || window).dispatchEvent(new PointerEvent(type, { pointerId: id, pointerType: 'touch', isPrimary: false,
      clientX: X, clientY: Y, bubbles: true, cancelable: true, button: 0, buttons: type === 'pointerup' ? 0 : 1 }));
    ev('pointerdown', x, y, el);
    return { id, bouge(X, Y) { x = X; y = Y; ev('pointermove', X, Y); }, leve() { ev('pointerup', x, y); } };
  }
  const centre = (tc, slot) => tc.pos[slot];
  // un appui bref sur un bouton tactile (posé, levé)
  function taper(tc, slot) { const P = centre(tc, slot), d = doigt(tc.el[slot], P.x, P.y); d.leve(); }
  // un clic au doigt sur un élément HTML (le toucher donne un clic)
  const cliquer = (el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  // une image « simulation + tactile » sans rendu : les pas, puis la fin d'image du calque tactile (js/touch.js tick)
  const imageSim = (dt = 1 / 60) => { jeu.avancer(dt); const tc = TC(); if (tc) tc.tick(dt); };

  // ---- LE DOIGT pour dernière entrée : le vrai calque au téléphone ; sur PC, l'aide à la visée seule le croit ----
  function doigtPose(oui = true) {
    const tc = TC();
    if (tc && !tc.__simule) { const avant = tc.auDoigt; tc.auDoigt = oui; return () => { tc.auDoigt = avant; }; }
    const e = entree.tactile; entree.tactile = () => null; window.__touch = { __simule: true, auDoigt: oui, regardBouge: false };
    return () => { entree.tactile = e; delete window.__touch; };
  }

  // ---- UNE MANETTE SIMULÉE (disposition « standard », sans bouton enfoncé au branchement) ----
  function fausseManette() {
    const m = game.input.manette;
    const gp = { index: 0, id: 'Xbox Wireless Controller (STANDARD GAMEPAD Vendor: 045e Product: 0b13)', mapping: 'standard', connected: true,
      buttons: PAD_BOUTONS.map(() => ({ pressed: false, value: 0 })), axes: [0, 0, 0, 0],
      vibrationActuator: { playEffect: () => Promise.resolve('complete') } };
    let branchee = true;
    const vib = [], vibrer = m.vibrer;
    m.pads = () => (branchee ? [gp] : []);
    m.vibrer = function (f, l, ms) { vib.push([r3(f), r3(l), ms]); return vibrer.call(this, f, l, ms); };
    m.annoncees.add(0);                                       // (pas de notification « manette connectée »)
    m.adopter(gp);
    return {
      gp, vib, m,
      bouton(nom, bas = true) { const i = PAD_BOUTONS.indexOf(nom); gp.buttons[i] = { pressed: !!bas, value: bas ? 1 : 0 }; },
      stick(cote, x, y) { if (cote === 'g') { gp.axes[0] = x; gp.axes[1] = y; } else { gp.axes[2] = x; gp.axes[3] = y; } },
      lacher() { for (let i = 0; i < gp.buttons.length; i++) gp.buttons[i] = { pressed: false, value: 0 }; gp.axes.fill(0); },
      debrancher() { branchee = false; }, brancher() { branchee = true; },
      scruter(dt = 1 / 60) { m.scruter(game, dt); },
      rendre() {
        delete m.pads; delete m.vibrer;
        m.toutRelacher(); m.muets.clear(); m.index = null; m.ctx = null; m.axe = null;
        m.annoncees.delete(0); m.nav.quitter(); m.passerAuClavier();
      },
    };
  }
  // l'essai : Haythem armé (Assaut) au départ du hall ; `mannequins` (0 par défaut : aucune aide ne s'en mêle)
  async function essai(o = {}) { await jeu.lancer('essai', { graine: 9, mannequins: [], ...o }); await jeu.images(2); return game.partie; }
  // le buste simulé d'un acteur (le milieu de la capsule du torse) et ses angles vus de l'œil de Haythem
  const _o = new THREE.Vector3();
  function angles(p, b) {
    const K = capsules(b, []), t = K.find((k) => k.zone === 'torse'), o = p.local.oeil(_o);
    const x = t.t === 'c' ? (t.ax + t.bx) / 2 : t.cx, y = t.t === 'c' ? (t.ay + t.by) / 2 : t.cy, z = t.t === 'c' ? (t.az + t.bz) / 2 : t.cz;
    const vx = x - o.x, vy = y - o.y, vz = z - o.z, d = Math.hypot(vx, vy, vz);
    return { l: Math.atan2(-vx, -vz), t: Math.atan2(-vy, Math.hypot(vx, vz)), d, x, y, z };
  }

  // 1. LES TROIS CONTEXTES : présents ; aucun recouvrement, tous dans l'écran, à 812 × 375, 915 × 412 et 1138 × 568
  T('1 contextes combat, prop, chasseur : présents, sans recouvrement, dans l’écran', async () => {
    const res = [], vus = {};
    const cles = (p) => Object.keys(TouchControls.prototype._contexteJeu(p).v);
    // combat : l'essai (Assaut : frag et flash)
    let p = await essai({ mannequins: 1 });
    vus.combat = cles(p);
    // chasseur : le prop hunt, Haythem chasseur (présentation : il voit tout, sauf pendant la cachette)
    await jeu.lancer('prophunt', { graine: 1, zone: 'e1', acteurs: 4, premierRole: 'chasseur' }); p = game.partie;
    vus.chasseur = cles(p);
    // prop : humain, puis déguisé (le front de la commande, comme le bouton DÉGUISER)
    await jeu.lancer('prophunt', { graine: 1, zone: 'e1', acteurs: 4, premierRole: 'prop' }); p = game.partie;
    const humain = cles(p);
    jeu.commande(0, { deguiser: true }, PAS); jeu.avancer(PAS * 2);
    vus.prop = cles(p);
    jeu.quitter('balade');
    res.push(['prop humain : DÉGUISER, SAUT, PROVOQUER', egal(humain.slice().sort(), ['pause', 'scores', 'tir', 'jsaut', 'rech'].sort()), humain.join(',')]);
    for (const [nom, L] of Object.entries(CONTEXTES_JEU)) res.push([nom + ' : ' + L.length + ' boutons', egal((vus[nom] || []).slice().sort(), L.slice().sort()), (vus[nom] || []).join(',')]);
    const Tt = settings.controls.tactile;
    for (const [W, H] of [[812, 375], [915, 412], [1138, 568]]) {
      const D = disposition(W, H, Tt);
      for (const [nom, L] of Object.entries(CONTEXTES_JEU)) {
        const C = [...L.map((id) => D.pos[id]), D.repos];
        let chev = 0, dehors = 0, ecart = Infinity;
        for (let i = 0; i < C.length; i++) {
          for (let j = i + 1; j < C.length; j++) { const e = Math.hypot(C[i].x - C[j].x, C[i].y - C[j].y) - C[i].r - C[j].r; ecart = Math.min(ecart, e); if (e < 0) chev++; }
          const c = C[i]; if (c.x - c.r < 0 || c.x + c.r > W || c.y - c.r < 0 || c.y + c.r > H) dehors++;
        }
        res.push([`${nom} ${W}×${H}`, chev === 0 && dehors === 0, `${chev} recouvrement, ${dehors} dehors, écart mini ${ecart.toFixed(1)} px`]);
      }
    }
    // au téléphone : la vraie disposition de la fenêtre, contexte de l'essai à l'écran
    const tc = TC();
    if (tc) {
      await essai({ mannequins: 1 }); tc.refresh();
      const montres = Object.keys(tc._contexte().v).filter((id) => !tc.el[id].hidden);
      res.push(['à l’écran (fenêtre) : les boutons du combat', egal(montres.slice().sort(), CONTEXTES_JEU.combat.slice().sort()), montres.join(',')]);
      jeu.quitter('balade');
    }
    return rendre(res);
  }, { delai: 120 });

  // 2. TIR EN RÔLE MIXTE : le doigt glisse de 100 px sur TIR → camYaw change de 0,006 × s rad/px, tir tenu pendant le glissé
  T('2 TIR mixte : 100 px de glissé → 0,006 × s rad/px, tir tenu', async () => {
    const tc = TC(); if (!tc) return SANS_TACTILE('TIR mixte');
    settings.controls.fps.tirAuto = false;
    const p = await essai(), a = p.local, res = [];
    const rendreD = doigtPose(true); tc.refresh();
    try {
      const el = tc.el.tir, P = centre(tc, 'tir'), s = settings.controls.sensitivity;
      res.push(['TIR montré', !el.hidden && el.dataset.action === 'tir']);
      const t0 = game.camPitch; let dLacet = 0, tenu = true;
      const d = doigt(el, P.x, P.y);
      jeu.avancer(PAS); tenu = tenu && a.cmd.tir;
      for (let i = 1; i <= 10; i++) { const y0 = game.camYaw; d.bouge(P.x + 10 * i, P.y); dLacet += game.camYaw - y0; jeu.avancer(PAS); tenu = tenu && a.cmd.tir; }
      const pitchGlisse = game.camPitch;
      d.leve(); jeu.avancer(PAS);
      const attendu = -100 * TACTILE_JEU.regard * s;
      res.push(['lacet −100 × 0,006 × s', pres(dLacet, attendu, 1e-9), `${dLacet.toFixed(6)} rad pour ${attendu.toFixed(6)}`]);
      res.push(['tangage inchangé (glissé horizontal)', pitchGlisse === t0]);
      res.push(['tir tenu pendant tout le glissé', tenu]);
      res.push(['relâché au lever', !a.cmd.tir]);
    } finally { rendreD(); jeu.quitter('balade'); }
    return rendre(res);
  });

  // 3. LE TIR AUTO (défaut au téléphone) : le réticule 0,12 s sur un ennemi à ≤ 30 m → tir ; jamais à la souris
  T('3 tir auto : 0,12 s sur un ennemi → tir ; portée ; jamais à la souris', async () => {
    const res = [], portee = AIDE.tirAuto.portee;
    settings.controls.fps.tirAuto = true;
    const rendreD = doigtPose(true);
    try {
      const p = await essai({ mannequins: 1 }), m = p.acteurParId(1);
      m.protegeT = 1e9;                                        // (le mannequin ne tombe pas : chaque cas se joue sur lui)
      const vu = p.balistique.vue(...p.local.oeil(new THREE.Vector3()).toArray(), angles(p, m).x, angles(p, m).y, angles(p, m).z);
      res.push(['mannequin vu', vu, r3(angles(p, m).d) + ' m']);
      // (a) au doigt : le premier tir 0,12 s après que le réticule s'est posé
      jeu.viser(0, 1);
      let premier = null; const off = p.sur('tir', (e) => { if (e.a === 0 && premier === null) premier = p.t; });
      const t0 = p.t; jeu.avancer(0.3); off();
      const dt = premier === null ? null : premier - t0;
      res.push(['tir après 0,12 s', dt !== null && dt >= AIDE.tirAuto.delai - 1e-9 && dt <= AIDE.tirAuto.delai + 2 * PAS + 1e-9, dt === null ? 'aucun tir' : r3(dt) + ' s']);
      res.push(['état de l’aide : tir auto', !!etatAide(p).tirAuto]);
      // (b) le réticule hors de la silhouette (10° à côté) : rien
      jeu.avancer(0.2); jeu.viser(0, { lacet: game.camYaw + 10 * DEG, tangage: game.camPitch });
      let n = 0; const off2 = p.sur('tir', (e) => { if (e.a === 0) n++; }); jeu.avancer(0.4); off2();
      res.push(['à côté : aucun tir', n === 0, n + ' tirs']);
      // (c) au-delà de la portée (réglée à 2 m le temps du test) : rien
      AIDE.tirAuto.portee = 2; jeu.viser(0, 1);
      n = 0; const off3 = p.sur('tir', (e) => { if (e.a === 0) n++; }); jeu.avancer(0.4); off3(); AIDE.tirAuto.portee = portee;
      res.push(['hors de portée : aucun tir', n === 0, n + ' tirs']);
      // (d) à la souris (la dernière entrée : clavier-souris) : rien, jamais
      window.__touch.auDoigt = false; jeu.viser(0, 1);
      n = 0; const off4 = p.sur('tir', (e) => { if (e.a === 0) n++; }); jeu.avancer(0.5); off4();
      res.push(['à la souris : aucun tir', n === 0, n + ' tirs']);
      // (e) réglage coupé : rien
      window.__touch.auDoigt = true; settings.controls.fps.tirAuto = false; jeu.viser(0, 1);
      n = 0; const off5 = p.sur('tir', (e) => { if (e.a === 0) n++; }); jeu.avancer(0.5); off5();
      res.push(['tir auto coupé : aucun tir', n === 0, n + ' tirs']);
    } finally { AIDE.tirAuto.portee = portee; rendreD(); jeu.quitter('balade'); }
    return rendre(res);
  });

  // 4. LE SPRINT VERROUILLÉ au bord du joystick (le sprint tactique demandé) ; glisser sur ACCROUPI en sprint → glissade
  T('4 joystick au-delà du bord → sprint verrouillé (tactique) ; ACCROUPI en sprint → glissade', async () => {
    const tc = TC(); if (!tc) return SANS_TACTILE('sprint verrouillé, glissade');
    settings.controls.fps.tirAuto = false;
    const p = await essai(), a = p.local, c = a.cmd, res = [];
    const rendreD = doigtPose(true); tc.refresh();
    try {
      const x0 = tc.repos.x, y0 = tc.repos.y, R = tc.course;
      const d = doigt(canvas(), x0, y0);
      res.push(['pouce sur le joystick', tc.stickId === d.id]);
      d.bouge(x0, y0 - R * 0.5); imageSim(PAS);
      res.push(['à mi-course : pas de sprint', !c.sprint && !tc.sprintVerrou]);
      d.bouge(x0, y0 - R * 1.2); imageSim(PAS);
      res.push(['au-delà du bord : verrouillé', tc.sprintVerrou && c.sprint]);
      res.push(['sprint tactique demandé (front)', c.sprintTact === true]);
      d.bouge(x0, y0 - R * 0.6); imageSim(PAS);
      res.push(['revenu à 60 % vers l’avant : toujours le sprint', tc.sprintVerrou && c.sprint]);
      d.leve(); imageSim(PAS);
      let court = true; for (let i = 0; i < 24; i++) { imageSim(PAS); court = court && c.sprint && c.ay === 1 && c.amp === 1; }
      res.push(['pouce levé : il court tout droit', tc.courseAuto && court]);
      // la glissade : ACCROUPI en sprint (un appui, le pouce qui glisse vers le bas)
      const P = centre(tc, 'accr'), g = doigt(tc.el.accr, P.x, P.y); g.bouge(P.x, P.y + 30);
      imageSim(PAS);
      res.push(['ACCROUPI en sprint : accroupi ET sprint au même pas', c.accroupi && c.sprint]);
      g.leve();
      for (let i = 0; i < 24; i++) imageSim(PAS);
      res.push(['puis le sprint rendu (0,15 s)', !tc.sprintVerrou && !tc.courseAuto && !c.sprint]);
      // le pouce reposé arrête la course verrouillée
      const e = doigt(canvas(), x0, y0); e.bouge(x0, y0 - R * 1.3); imageSim(PAS); e.leve(); imageSim(PAS);
      const f = doigt(canvas(), x0, y0); imageSim(PAS);
      res.push(['pouce reposé : la course s’arrête', !tc.sprintVerrou && !tc.courseAuto && !c.sprint]);
      f.leve(); imageSim(PAS);
      // vers le côté au bord : pas de verrou (le sprint d'un jeu de tir est vers l'avant)
      const h = doigt(canvas(), x0, y0); h.bouge(x0 + R * 1.2, y0); imageSim(PAS);
      res.push(['au bord sur le côté : pas de verrou', !tc.sprintVerrou]);
      h.leve(); imageSim(PAS);
    } finally { rendreD(); tc._desverrouillerSprint(); jeu.quitter('balade'); }
    return rendre(res);
  });

  // 5. LA MANETTE EN PARTIE : les boutons du combat, L3 (double = tactique ; son verrou est celui de lireCommande, L-B : à
  //    F2), bornes ± 1,48, 3,6 rad/s (^1,8),
  //    accélération × 1,35, × 0,55 en visée
  T('5 manette en partie : boutons, L3, bornes, vitesse, accélération, visée', async () => {
    settings.controls.fps.tirAuto = false;
    const p = await essai(), a = p.local, c = a.cmd, res = [];
    a.protegeT = 1e9;                                          // (la grenade lancée par RB ne le blesse pas)
    const F = fausseManette();
    try {
      const un = (b, champ, lire = () => c[champ]) => {
        F.bouton(b, true); F.scruter(); jeu.avancer(PAS); const v = lire();
        F.bouton(b, false); F.scruter(); jeu.avancer(PAS);
        return v;
      };
      const B = { RT: 'tir', LT: 'visee', B: 'accroupi', A: 'saut', X: 'recharger', Y: 'armeSuiv', RB: 'letale', LB: 'tactique', R3: 'couteau', L3: 'sprint' };
      const ko = [];
      for (const [b, champ] of Object.entries(B)) if (!un(b, champ)) ko.push(b + '→' + champ);
      if (!un('Back', 'scores', () => game.input.down('scores'))) ko.push('Back→scores');
      jeu.avancer(0.5);
      res.push(['RT tir, LT visée, L3 sprint, R3 couteau, RB létale, LB tactique, Y arme, X recharger, B accroupi, A saut, Back scores', ko.length === 0, ko.join(', ')]);
      // L3 deux fois en moins de 0,30 s : le sprint tactique
      F.bouton('L3', true); F.scruter(); jeu.avancer(PAS); F.bouton('L3', false); F.scruter(); jeu.avancer(0.1);
      F.bouton('L3', true); F.scruter(); jeu.avancer(PAS); const tact = c.sprintTact; F.bouton('L3', false); F.scruter(); jeu.avancer(PAS);
      res.push(['L3 double → sprint tactique', tact === true]);
      jeu.avancer(0.5);
      // les bornes du tangage : ± 1,48
      F.stick('d', 0, 1); for (let i = 0; i < 90; i++) F.scruter(); const bas = game.camPitch;
      F.stick('d', 0, -1); for (let i = 0; i < 120; i++) F.scruter(); const haut = game.camPitch;
      F.stick('d', 0, 0); F.scruter();
      res.push(['bornes ± 1,48', pres(bas, 1.48, 1e-9) && pres(haut, -1.48, 1e-9), r3(haut) + ' / ' + r3(bas)]);
      game.camPitch = 0;
      // 3,6 rad/s à sensibilité 1, courbe ^1,8 : poussée utile 0,6 (zone morte 0,15) pendant 0,2 s
      const dz = settings.controls.pad.deadzone, x6 = dz + 0.6 * (1 - dz), k6 = courbe(0.6, 1.8);
      let y0 = game.camYaw; F.stick('d', x6, 0); for (let i = 0; i < 12; i++) F.scruter(1 / 60);
      const v6 = (y0 - game.camYaw) / 0.2, a6 = STICK_JEU.vitesse * k6;
      res.push(['3,6 rad/s × 0,6^1,8', pres(v6, a6, a6 * 0.01), r3(v6) + ' rad/s pour ' + r3(a6)]);
      F.stick('d', 0, 0); F.scruter();
      // l'accélération de virage : à fond, 3,6 avant 0,25 s, puis × 1,35 atteint 0,3 s plus tard
      const vit = []; F.stick('d', 1, 0);
      for (let i = 0; i < 48; i++) { y0 = game.camYaw; F.scruter(1 / 60); vit.push((y0 - game.camYaw) * 60); }
      F.stick('d', 0, 0); F.scruter();
      const v0 = vit[6], vFin = vit[47], vMi = vit[27];
      res.push(['accélération : 3,6 puis 4,86 (× 1,35 en 0,3 s)', pres(v0, 3.6, 0.036) && pres(vFin, 3.6 * 1.35, 0.05) && vMi > v0 + 0.1 && vMi < vFin - 0.1,
        `${r3(v0)} → ${r3(vMi)} → ${r3(vFin)} rad/s`]);
      // en visée : × 0,55
      game.input.presser('Pad:LT'); F.bouton('LT', true); F.scruter(); jeu.avancer(0.4);
      const vis = a.arsenal ? a.arsenal.visee : 0;
      y0 = game.camYaw; F.stick('d', x6, 0); for (let i = 0; i < 12; i++) F.scruter(1 / 60);
      const vV = (y0 - game.camYaw) / 0.2;
      res.push(['en visée × 0,55', vis === 1 && pres(vV, a6 * STICK_JEU.visee, a6 * 0.01), `visée ${r3(vis)}, ${r3(vV)} rad/s pour ${r3(a6 * STICK_JEU.visee)}`]);
    } finally { F.rendre(); jeu.quitter('balade'); }
    return rendre(res);
  });

  // 6. L'AIDE À LA VISÉE (manette et doigt) : ralentissement × 0,55 / × 0,7, suivi + 45 %, aimant d'ADS 70 % ; à la souris,
  //    la commande identique au bit près avec et sans
  T('6 aide à la visée : ralentissement, suivi, aimant ; à la souris, identique au bit près', async () => {
    settings.controls.fps.tirAuto = false;
    const res = [], portee = AIDE.ralenti.portee;
    const rendreD = doigtPose(false);
    const M = game.input.manette;
    try {
      let p = await essai({ mannequins: 1 }); const m = p.acteurParId(1);
      entree.manette = true;
      // (a) le ralentissement : dans le cône atan(0,45 / d) + 1°, × 0,7 à la hanche, × 0,55 en visée ; hors du cône, 1
      jeu.viser(0, 1); let A = angles(p, m); const s = Math.atan(AIDE.ralenti.demiBuste / A.d) + AIDE.ralenti.margeDeg * DEG;
      game.camYaw = A.l + 0.9 * s; const dedans = facteurStick(game);
      game.camYaw = A.l + 1.1 * s; const dehors = facteurStick(game);
      game.camYaw = A.l;
      game.input.presser('Pad:LT'); jeu.avancer(0.4); jeu.viser(0, 1); const enVisee = facteurStick(game);
      game.input.relacher('Pad:LT'); jeu.avancer(0.4); jeu.viser(0, 1);
      res.push(['hanche × 0,7 dans le cône', pres(dedans, AIDE.ralenti.hanche, 1e-9), `${r3(dedans)} à ${r3(A.d)} m (cône ${r3(s / DEG)}°)`]);
      res.push(['hors du cône : 1', dehors === 1]);
      res.push(['en visée × 0,55', pres(enVisee, AIDE.ralenti.visee, 1e-9), r3(enVisee)]);
      // vu, et à ≤ 40 m (les deux portes de l'aide : une vue bouchée, une portée réduite le temps du test)
      const vue = p.balistique.vue; p.balistique.vue = () => false; const cache = facteurStick(game); p.balistique.vue = vue;
      AIDE.ralenti.portee = 2; const loin = facteurStick(game); AIDE.ralenti.portee = portee;
      res.push(['ennemi caché : 1', cache === 1]); res.push(['au-delà de la portée : 1', loin === 1]);
      entree.manette = false; const souris = facteurStick(game); entree.manette = true;
      res.push(['à la souris : 1', souris === 1]);
      // (b) le suivi : le regard bouge (stick droit), la cible file en travers → + 45 % de sa vitesse angulaire
      jeu.viser(0, 1); A = angles(p, m);
      const nx = Math.cos(A.l), nz = -Math.sin(A.l);            // (le travers, horizontal)
      M.regardBouge = true;
      let ecart = 0, nS = 0, lPrec = angles(p, m).l;
      for (let i = 0; i < 15; i++) {
        const q = m.corps.pos; jeu.teleporter(1, q.x + nx * 0.025, q.y, q.z + nz * 0.025);
        const lCible = angles(p, m).l, y0 = game.camYaw;
        jeu.avancer(PAS); M.regardBouge = true;
        if (i > 0) { ecart = Math.max(ecart, Math.abs(enrouler(game.camYaw - y0) - AIDE.suivi.part * enrouler(lCible - lPrec))); nS++; }
        lPrec = lCible;
      }
      res.push(['suivi + 45 % de la vitesse angulaire', nS === 14 && ecart < 1e-9, 'écart max ' + ecart.toExponential(2) + ' rad']);
      M.regardBouge = false; let y1 = game.camYaw;
      const q = m.corps.pos; jeu.teleporter(1, q.x + nx * 0.025, q.y, q.z + nz * 0.025); jeu.avancer(PAS);
      res.push(['regard immobile : pas de suivi', game.camYaw === y1]);
      // (c) l'aimant d'ADS : la cible à 5° → 70 % de l'écart rattrapé pendant le temps d'ADS
      jeu.quitter('balade'); p = await essai({ mannequins: 1 }); const m2 = p.acteurParId(1);
      entree.manette = true; jeu.viser(0, 1); A = angles(p, m2);
      game.camYaw = A.l + 5 * DEG; const e0 = enrouler(game.camYaw - A.l);
      game.input.presser('Pad:LT'); jeu.avancer(0.35);
      const e1 = enrouler(game.camYaw - angles(p, m2).l);
      res.push(['aimant : 30 % de l’écart restant', pres(e1 / e0, 1 - AIDE.aimant.part, 0.005), `${r3(e0 / DEG)}° → ${r3(e1 / DEG)}°`]);
      res.push(['commande réécrite (cmd.lacet = camYaw)', p.local.cmd.lacet === game.camYaw]);
      game.input.relacher('Pad:LT'); jeu.avancer(0.4);
      // au-delà de 7° : pas d'aimant
      jeu.viser(0, 1); game.camYaw = angles(p, m2).l + 9 * DEG; const y2 = game.camYaw;
      game.input.presser('Pad:LT'); jeu.avancer(0.35); game.input.relacher('Pad:LT');
      res.push(['à 9° : pas d’aimant', game.camYaw === y2]);
      jeu.quitter('balade');
      // (d) À LA SOURIS : le même script, aide allumée puis coupée → les mêmes commandes, au bit près
      entree.manette = false;
      const script = async (aide) => {
        settings.controls.fps.aideVisee = aide;
        const q2 = await essai({ mannequins: 1 }), L = [];
        jeu.viser(0, 1); game.camYaw = angles(q2, q2.acteurParId(1)).l + 4 * DEG;
        game.input.presser('Pad:LT');
        // (sans `seq` : le nombre de pas joués par les images de l'entrée en partie dépend de l'horloge)
        for (let i = 0; i < 40; i++) { jeu.avancer(PAS); L.push([...versTableau(q2.local.cmd).slice(1), game.camYaw, game.camPitch]); }
        game.input.relacher('Pad:LT');
        jeu.quitter('balade'); return L;
      };
      const avec = await script(true), sans = await script(false);
      res.push(['à la souris : identique au bit près', egal(avec, sans), avec.length + ' pas']);
    } finally {
      entree.manette = false; M.regardBouge = false; AIDE.ralenti.portee = portee; rendreD();
      game.input.relacher('Pad:LT'); jeu.quitter('balade');
    }
    return rendre(res);
  }, { delai: 120 });

  // 7. LES VIBRATIONS : tir faible 40 ms, touche reçue forte 120 ms ; une annonce, une élimination : UNE fois ; pas de
  //    hoops-feedback en partie
  T('7 vibrations sur les événements : tir, touche reçue ; annonce et élimination une fois', async () => {
    settings.controls.fps.tirAuto = false;
    const res = [];
    let retours = 0; const r = () => retours++; document.addEventListener('hoops-feedback', r);
    const p = await essai({ mannequins: 1 }), F = fausseManette();
    try {
      F.vib.length = 0; jeu.tirer(0, { n: 1, cible: 1 }); const tir = F.vib.slice();
      res.push(['tir : faible, 40 ms', tir.length >= 1 && tir.every((v) => egal(v, VIBRATIONS_JEU.tir)), JSON.stringify(tir)]);
      F.vib.length = 0; p.infliger(p.local, 10, { par: 1 }); const touche = F.vib.slice();
      res.push(['touche reçue : forte, 120 ms', touche.length === 1 && touche[0][0] >= 0.5 && touche[0][2] === 120, JSON.stringify(touche)]);
      F.vib.length = 0; p.annonce('ESSAI', 'info'); const annonce = F.vib.length;
      res.push(['annonce : une fois', annonce === 1, annonce + '']);
      F.vib.length = 0; p.infliger(p.acteurParId(1), 1000, { par: 0 }); const elim = F.vib.length;
      res.push(['élimination : une fois', elim === 1, elim + '']);
      F.vib.length = 0; document.dispatchEvent(new CustomEvent('hoops-feedback', { detail: { text: 'MANETTE CONNECTÉE', cls: 'info' } }));
      res.push(['hoops-feedback en partie : sans vibration', F.vib.length === 0]);
      res.push(['aucun hoops-feedback émis en partie', retours === 1, retours + ' (le seul : celui du test)']);
    } finally { F.rendre(); document.removeEventListener('hoops-feedback', r); jeu.quitter('balade'); }
    return rendre(res);
  });

  // 8. LA BALADE : tactile = référence ; manette −0,1 / 0,9 et 2,9 rad/s ; racines phone, options, overlay ; B sur la pause
  T('8 balade : tactile = référence, manette d’aujourd’hui, racines, B sur la pause', async () => {
    const res = [], ref = jeu.reference || await jeu.chargerReference(), tc = TC();
    if (tc) { tc.refresh(); res.push(['tactile = référence', egal(tc._contexte(), ref.tactile), JSON.stringify(tc._contexte())]); }
    const F = fausseManette(), n = game.input.manette.nav;
    try {
      F.scruter();
      res.push(['aucune racine en balade', n.ouvertes().length === 0, n.ouvertes().map((e) => e.id).join(',')]);
      let y0 = game.camYaw; F.stick('d', 1, 0); for (let i = 0; i < 30; i++) F.scruter(1 / 60);
      const v = (y0 - game.camYaw) / 0.5; F.stick('d', 0, 0); F.scruter();
      res.push(['2,9 rad/s', pres(v, 2.9, 0.029), r3(v) + ' rad/s']);
      F.stick('d', 0, 1); for (let i = 0; i < 120; i++) F.scruter(); const bas = game.camPitch;
      F.stick('d', 0, -1); for (let i = 0; i < 120; i++) F.scruter(); const haut = game.camPitch;
      F.stick('d', 0, 0); F.scruter();
      res.push(['bornes −0,1 / 0,9', pres(haut, -0.1, 1e-9) && pres(bas, 0.9, 1e-9), r3(haut) + ' / ' + r3(bas)]);
      game.placerAuDepart();
      // la pause : racine overlay, la croix y promène le focus, B « tape » la pause (elle se referme)
      game.togglePause(); game.frame(1 / 60);
      const rO = n.racine(); const f0 = n.cur;
      F.bouton('Down', true); game.frame(1 / 60); F.bouton('Down', false); game.frame(1 / 60);
      res.push(['overlay navigable', !!rO && rO.id === 'overlay' && !!n.cur && n.cur !== f0, (rO && rO.id) + ' : ' + (f0 && f0.textContent) + ' → ' + (n.cur && n.cur.textContent)]);
      F.bouton('B', true); game.frame(1 / 60); F.bouton('B', false); game.frame(1 / 60); game.frame(1 / 60);
      res.push(['B sur la pause : refermée', !game.paused && document.getElementById('overlay').hidden]);
      // les options : racine, B les referme
      game.cb.onOptions?.(); game.frame(1 / 60);
      const rOp = n.racine();
      F.bouton('B', true); game.frame(1 / 60); F.bouton('B', false); game.frame(1 / 60);
      res.push(['options navigables, B les ferme', !!rOp && rOp.id === 'options' && !(n.racine() && n.racine().id === 'options')]);
      // le téléphone : racine, B le range
      const ph = window.__phone;
      if (ph && ph.toggle) {
        ph.toggle(); for (let i = 0; i < 3; i++) { game.frame(1 / 60); await new Promise((q) => setTimeout(q, 30)); }
        const rP = n.racine();
        F.bouton('B', true); game.frame(1 / 60); F.bouton('B', false); game.frame(1 / 60);
        await new Promise((q) => setTimeout(q, 60)); game.frame(1 / 60);
        res.push(['téléphone navigable, B le range', !!rP && rP.id === 'phone' && !(n.racine() && n.racine().id === 'phone'), rP ? rP.id : 'aucune']);
      }
    } finally {
      F.rendre();
      const P = document.getElementById('phone'); if (P && P.classList.contains('on')) window.__phone?.toggle?.();
      game.input.blocked = false; if (game.paused) game.togglePause();
    }
    return rendre(res);
  });

  // 9. LES RACINES DU JEU (menu-jeu, reglage-jeu, fin-jeu, credits-jeu) navigables ; B revient (data-retour-action, data-retour)
  T('9 racines du jeu navigables ; B revient', async () => {
    const res = [], n = game.input.manette.nav;
    const F = fausseManette();
    const fixe = [];
    try {
      jeu.quitter('menu'); for (let i = 0; i < 3; i++) game.frame(1 / 60);
      const r = n.racine();
      res.push(['menu-jeu : racine, focus sur BALADE LIBRE', !!r && r.id === 'menu-jeu' && !!n.cur && n.cur.dataset.act === 'balade', r ? r.id + ' / ' + (n.cur && n.cur.dataset.act) : 'aucune']);
      const vus = [];
      for (let i = 0; i < 5; i++) { F.bouton('Down', true); game.frame(1 / 60); F.bouton('Down', false); game.frame(1 / 60); vus.push(n.cur && n.cur.dataset.act); }
      res.push(['la croix descend la liste', egal(vus, ['combat', 'prophunt', 'stand', 'options', 'credits']), vus.join(',')]);
      // les écrans de réglages et de crédits : des écrans d'essai inscrits comme ceux de L-U (les vrais : le test de F2)
      for (const id of ['reglage-jeu', 'credits-jeu']) {
        let el = document.getElementById(id);
        if (el) continue;
        {
          el = document.createElement('div'); el.id = id; el.style.cssText = 'position:fixed;inset:20% 30%;z-index:60;background:#111';
          el.innerHTML = `<button data-act="a">A</button><button data-act="b">B</button><button class="back" data-act="retour">RETOUR</button>`;
          el.dataset.retour = '[data-act="retour"]'; let n0 = 0; el.querySelector('[data-act="retour"]').onclick = () => { n0++; el.hidden = true; };
          el.__retours = () => n0;
          document.body.appendChild(el); fixe.push(el); ajouterRacine(id, { avant: 'menu-jeu' });
        }
        el.hidden = false; for (let i = 0; i < 2; i++) game.frame(1 / 60);
        const rr = n.racine();
        F.bouton('Down', true); game.frame(1 / 60); F.bouton('Down', false); game.frame(1 / 60);
        const bouge = !!n.cur && rr && rr.contains(n.cur);
        F.bouton('B', true); game.frame(1 / 60); F.bouton('B', false); game.frame(1 / 60); game.frame(1 / 60);
        res.push([id + ' : navigable, B revient', !!rr && rr.id === id && bouge && (el.hidden || !(n.racine() && n.racine().id === id)), rr ? rr.id : 'aucune']);
        if (!el.hidden) el.hidden = true;
      }
      // B « tape » l'action de data-retour-action (ici la pause : au menu, rien ne s'ouvre ; le front est là)
      const t = document.createElement('div'); t.id = 'test-li-racine'; t.style.cssText = 'position:fixed;inset:30%;z-index:61;background:#222';
      t.innerHTML = '<button>UN</button><button>DEUX</button>'; t.dataset.retourAction = 'pause';
      document.body.appendChild(t); fixe.push(t); ajouterRacine('test-li-racine', { avant: 'phone' });
      game.frame(1 / 60); const rt = n.racine(); game.input.purger();
      F.bouton('B', true); F.scruter(); F.bouton('B', false);
      res.push(['data-retour-action : l’action tapée', !!rt && rt.id === 'test-li-racine' && game.input.peek('pause'), rt ? rt.id : 'aucune']);
      t.remove(); F.scruter(); game.input.purger();
      // fin-jeu (sur une partie) : racine, focus posé, la croix s'y promène
      await essai();
      const menu = document.getElementById('fin-jeu');
      if (menu) {
        if (menu.hidden) menu.hidden = false;
        for (let i = 0; i < 2; i++) game.frame(1 / 60);
        const rf = n.racine();
        F.bouton('Up', true); game.frame(1 / 60); F.bouton('Up', false); game.frame(1 / 60);
        res.push(['fin-jeu navigable', !!rf && rf.id === 'fin-jeu' && !!n.cur && rf.contains(n.cur), rf ? rf.id : 'aucune']);
        menu.hidden = true;
      }
      res.push(['racines inscrites', ['menu-jeu', 'fin-jeu'].every((id) => racinesInscrites().includes(id)), racinesInscrites().join(',')]);
    } finally {
      for (const e of fixe) e.remove();
      F.rendre(); jeu.quitter('balade');
    }
    return rendre(res);
  });

  // 10. LE MODE 'menu' : le calque tactile caché ; en partie : montré (le contexte de la partie) ; en balade : celui d'aujourd'hui
  T('10 menu : calque tactile caché ; partie : montré ; balade : rendu', async () => {
    const tc = TC(); if (!tc) return SANS_TACTILE('calque tactile au menu et en partie');
    const res = [], ref = jeu.reference || await jeu.chargerReference();
    jeu.quitter('menu'); game.frame(1 / 60);
    res.push(['menu : caché', tc.root.hidden && game.mode === 'menu']);
    await essai(); game.frame(1 / 60);
    res.push(['partie : montré, TIR à l’écran', !tc.root.hidden && !tc.el.tir.hidden && tc.el.saut.hidden]);
    jeu.quitter('balade'); game.frame(1 / 60);
    res.push(['balade : montré, le contexte d’aujourd’hui', !tc.root.hidden && tc.el.tir.hidden && egal(tc._contexte(), ref.tactile)]);
    return rendre(res);
  });

  // 11. ?tel=1 AU DOIGT SEUL : menu → COMBAT → LANCER → un bot touché → II → Reprendre (aucune capture) → II → Quitter → menu,
  //     sans un seul événement clavier
  T('11 au doigt seul : menu → combat → bot touché → pause → reprise sans capture → quitter', async () => {
    const tc = TC(); if (!tc) return SANS_TACTILE('une partie au doigt seul');
    const res = [];
    let clavier = 0; const kd = () => clavier++; window.addEventListener('keydown', kd, true); window.addEventListener('keyup', kd, true);
    const cv = canvas(), rpl = cv.requestPointerLock; let captures = 0;
    cv.requestPointerLock = function (...a) { captures++; return rpl ? rpl.apply(this, a) : undefined; };
    const rendreD = doigtPose(true);
    try {
      jeu.quitter('menu'); for (let i = 0; i < 3; i++) game.frame(1 / 60);
      const b = document.querySelector('#menu-jeu [data-act="combat"]');
      res.push(['menu : COMBAT', !!b && game.mode === 'menu']);
      cliquer(b);
      // (les vrais réglages de L-U : LANCER)
      for (let i = 0; i < 400 && !game.partie; i++) {
        const R = document.getElementById('reglage-jeu'), L = R && !R.hidden ? R.querySelector('[data-act="lancer"]') : null;
        if (L) cliquer(L);
        await new Promise((q) => setTimeout(q, 100));
      }
      const p = game.partie;
      res.push(['en partie', !!p, p ? p.id : 'aucune']);
      if (!p) return rendre(res);
      jeu.simulerCapture('refusee');                           // (la capture « vraie » : refusée, si on la demandait)
      let demandes = 0; const cap = p.capturer.bind(p); p.capturer = () => { demandes++; return cap(); };
      // présentation, décompte (au doigt : pas de calque), la manche (des images de 0,05 s : six pas chacune)
      let calqueVu = false;
      for (let i = 0; i < 400 && p.phase !== 'manche'; i++) { game.frame(0.05); calqueVu = calqueVu || !document.getElementById('calque-clic').hidden; }
      res.push(['au doigt : pas de calque au décompte', p.phase === 'manche' && !calqueVu, p.phase]);
      // un bot ennemi posé à 5-7 m de Haythem, là où il le voit, visé : TIR au doigt
      const e = p.acteurs.find((x) => x !== p.local && x.vivant && p.ennemis(p.local, x) && x.corps === x.joueur);
      const q = p.local.pos.clone(), o = p.local.oeil(new THREE.Vector3());
      for (const [dx, dz] of [[-7, 0], [7, 0], [-5, 1.5], [5, 1.5], [0, 2.2], [-5, -1], [5, -1]]) {
        jeu.teleporter(e.id, q.x + dx, q.y, q.z + dz);
        if (game.collisions.libre(q.x + dx, q.z + dz, 0.3, q.y) && p.balistique.vue(o.x, o.y, o.z, q.x + dx, q.y + 1.3, q.z + dz)) break;
      }
      jeu.viser(0, e.id);
      let touches = 0; const off = p.sur('touche', (v) => { if (v.par === p.local.id && v.cible === e.id) touches++; });
      const P = centre(tc, 'tir'), d = doigt(tc.el.tir, P.x, P.y);
      for (let i = 0; i < 40; i++) { jeu.viser(0, e.id); game.frame(1 / 60); }
      d.leve(); off(); game.frame(1 / 60);
      res.push(['un bot touché', touches > 0, touches + ' touches']);
      // le clic qu'un toucher du terrain donne : il ne demande pas la capture (js/game.js _onClick)
      cv.dispatchEvent(new PointerEvent('click', { pointerType: 'touch', bubbles: true, cancelable: true }));
      // II : la pause
      taper(tc, 'pause'); game.frame(1 / 60);
      res.push(['II : pause', game.paused && !document.getElementById('overlay').hidden]);
      const bouton = (txt) => [...document.querySelectorAll('#overlay-buttons button')].find((x) => x.textContent.trim() === txt);
      // Reprendre (le toucher donne un clic) : aucune capture, la partie repart
      cliquer(bouton('Reprendre')); await new Promise((q2) => setTimeout(q2, 30));
      const t1 = p.t; for (let i = 0; i < 10; i++) game.frame(1 / 60);
      res.push(['Reprendre : sans capture, la partie repart', !game.paused && p.t > t1 && demandes === 0 && captures === 0, `capture demandée ${demandes}, requestPointerLock ${captures}`]);
      // II → Quitter la partie → le menu
      taper(tc, 'pause'); game.frame(1 / 60);
      cliquer(bouton('Quitter la partie')); for (let i = 0; i < 3; i++) game.frame(1 / 60);
      res.push(['Quitter → le menu', game.mode === 'menu' && !game.partie]);
      res.push(['aucun événement clavier', clavier === 0, clavier + '']);
    } finally {
      window.removeEventListener('keydown', kd, true); window.removeEventListener('keyup', kd, true);
      if (rpl) cv.requestPointerLock = rpl; else delete cv.requestPointerLock;
      rendreD(); jeu.simulerCapture(null); jeu.quitter('balade');
    }
    return rendre(res);
  }, { delai: 180 });

  // 12. LA MANETTE ET LA PAUSE : débranchée → pause ; Start → reprise SANS capture, la partie avance ; le calque « CLIQUE POUR
  //     JOUER » au décompte : A le ferme, le décompte part (et Haythem ne saute pas)
  T('12 manette : débranchée → pause ; Start → reprise sans capture ; A ferme le calque', async () => {
    const res = [];
    const rendreD = doigtPose(false);
    try {
      jeu.simulerCapture('refusee');
      let p = await essai();
      let F = fausseManette();
      F.scruter(); jeu.avancer(PAS);
      F.debrancher(); F.scruter();
      res.push(['débranchée : pause', game.paused && !document.getElementById('overlay').hidden && !entree.manette]);
      F.brancher(); F.m.adopter(F.gp); game.frame(1 / 60);
      F.bouton('Start', true); const t0 = p.t; game.frame(1 / 60); F.bouton('Start', false);
      for (let i = 0; i < 5; i++) game.frame(1 / 60);
      res.push(['Start : reprise sans capture, la partie avance', !game.paused && document.getElementById('calque-clic').hidden && p.t > t0]);
      F.rendre(); jeu.quitter('balade');
      // le calque au décompte (le clavier-souris pour dernière entrée), puis la manette : A
      const q = (await jeu.lancer('equipes', { graine: 12, zone: 'ss', allies: 0, ennemis: 1 }), game.partie);
      for (let i = 0; i < 400 && q.phase === 'presentation'; i++) game.frame(1 / 60);
      game.frame(1 / 60);
      const calque = document.getElementById('calque-clic');
      res.push(['décompte : calque, partie gelée', q.phase === 'decompte' && !calque.hidden && game.paused]);
      F = fausseManette(); game.frame(1 / 60);
      let saut = false; const sauts = q.sur('saut', (e) => { if (e.a === q.local.id) saut = true; });
      F.bouton('A', true); const t1 = q.t; game.frame(1 / 60);
      for (let i = 0; i < 10; i++) { game.frame(1 / 60); saut = saut || q.local.cmd.saut; }
      F.bouton('A', false); for (let i = 0; i < 3; i++) game.frame(1 / 60);
      sauts();
      res.push(['A : calque fermé, le décompte part', calque.hidden && !game.paused && q.t > t1 && (q.phase === 'decompte' || q.phase === 'manche'), q.phase]);
      res.push(['… sans saut', !saut]);
      F.rendre();
    } finally { rendreD(); jeu.simulerCapture(null); jeu.quitter('balade'); }
    return rendre(res);
  }, { delai: 120 });

  // 13. LA ROUE DES PROVOCATIONS à la manette (Haythem prop) : LB tenu l'ouvre ; le stick droit vers les 8 directions → choix
  //     0…7, camYaw immobile ; LB relâché → cmd.provoc = le choix. Au doigt : appui long sur PROVOQUER + glissé, de même ;
  //     appui bref : la dernière
  T('13 roue des provocations : manette (LB + stick) et doigt (appui long + glissé)', async () => {
    const res = [];
    await jeu.lancer('prophunt', { graine: 13, zone: 'e1', acteurs: 4, premierRole: 'prop' });
    const p = game.partie, c = p.local.cmd;
    const F = fausseManette();
    try {
      F.bouton('LB', true); F.scruter(); p.pas(PAS);
      res.push(['LB tenu : la roue ouverte', p.roueOuverte()]);
      const yaw = game.camYaw, pitch = game.camPitch, choix = [];
      for (let k = 0; k < 8; k++) { F.stick('d', Math.sin(k * Math.PI / 4), -Math.cos(k * Math.PI / 4)); F.scruter(); choix.push(p.roue.choix); }
      res.push(['8 directions → 0…7', egal(choix, [0, 1, 2, 3, 4, 5, 6, 7]), choix.join(',')]);
      res.push(['caméra immobile', game.camYaw === yaw && game.camPitch === pitch]);
      F.stick('d', Math.sin(5 * Math.PI / 4), -Math.cos(5 * Math.PI / 4)); F.scruter();
      F.bouton('LB', false); F.stick('d', 0, 0); F.scruter(); p.pas(PAS);
      res.push(['LB relâché → cmd.provoc = 5', c.provoc === 5 && !p.roueOuverte(), String(c.provoc)]);
      res.push(['jamais game.wheel', !game.wheel.isOpen]);
    } finally { F.rendre(); }
    const tc = TC();
    if (tc) {
      const rendreD = doigtPose(true);
      try {
        tc.refresh(); const el = tc.el.rech, P = centre(tc, 'rech');
        res.push(['PROVOQUER à l’écran', !el.hidden && el.dataset.action === 'provoquer']);
        const yaw = game.camYaw;
        const d = doigt(el, P.x, P.y); tc.tick(TACTILE_JEU.long + 0.02); p.pas(PAS);
        res.push(['appui long : la roue ouverte', p.roueOuverte()]);
        d.bouge(P.x + 60, P.y + 60);
        res.push(['glissé en bas à droite → 3', p.roue.choix === 3 && game.camYaw === yaw, String(p.roue.choix)]);
        d.leve(); tc.tick(1 / 60); p.pas(PAS);
        res.push(['levé → cmd.provoc = 3', c.provoc === 3 && !p.roueOuverte(), String(c.provoc)]);
        taper(tc, 'rech'); p.pas(PAS); tc.tick(1 / 60);
        res.push(['appui bref → la dernière (8)', c.provoc === 8, String(c.provoc)]);
      } finally { rendreD(); }
    }
    jeu.quitter('balade');
    return rendre(res);
  });

  // ---------------------------------------------------------------- À F2 (les vrais modules des autres lots)
  // les vrais écrans de L-U : réglages, crédits, fin — focus à la manette, B revient
  T('F2 · les vrais écrans de L-U navigables à la manette, B revient', async () => {
    const res = [], n = game.input.manette.nav, F = fausseManette();
    try {
      jeu.quitter('menu'); for (let i = 0; i < 3; i++) game.frame(1 / 60);
      for (const [act, id] of [['combat', 'reglage-jeu'], ['credits', 'credits-jeu']]) {
        const b = document.querySelector(`#menu-jeu [data-act="${act}"]`); if (b) cliquer(b);
        for (let i = 0; i < 3; i++) game.frame(1 / 60);
        const r = n.racine();
        F.bouton('Down', true); game.frame(1 / 60); F.bouton('Down', false); game.frame(1 / 60);
        F.bouton('B', true); game.frame(1 / 60); F.bouton('B', false); game.frame(1 / 60); game.frame(1 / 60);
        const apres = n.racine();
        res.push([id + ' : racine, B revient au menu', !!r && r.id === id && !!apres && apres.id === 'menu-jeu', `${r && r.id} → ${apres && apres.id}`]);
      }
    } finally { F.rendre(); jeu.quitter('balade'); }
    return rendre(res);
  }, { apresFusion: true });
  // l'aide sur les vrais bustes (capsules de L-A) : le ralentissement centré, le tir auto qui touche
  T('F2 · aide à la visée sur les vrais bustes (L-A)', async () => {
    const res = [], rendreD = doigtPose(true);
    try {
      settings.controls.fps.tirAuto = true;
      const p = await essai({ mannequins: 1 });
      entree.manette = true; jeu.viser(0, 1); const f = facteurStick(game); entree.manette = false;
      res.push(['centré : × 0,7', pres(f, AIDE.ralenti.hanche, 1e-9), r3(f)]);
      let n = 0; const off = p.sur('touche', (e) => { if (e.par === 0) n++; }); jeu.viser(0, 1); jeu.avancer(0.6); off();
      res.push(['tir auto : touché', n > 0, n + ' touches']);
    } finally { entree.manette = false; rendreD(); jeu.quitter('balade'); }
    return rendre(res);
  }, { apresFusion: true });
  // la vraie glissade et le vrai sprint tactique (L-B) depuis le tactile
  T('F2 · sprint verrouillé → sprint tactique réel ; ACCROUPI → glissade réelle (L-B)', async () => {
    const tc = TC(); if (!tc) return SANS_TACTILE('glissade réelle');
    settings.controls.fps.tirAuto = false;
    const p = await essai(), a = p.local, res = [], rendreD = doigtPose(true); tc.refresh();
    try {
      const x0 = tc.repos.x, y0 = tc.repos.y, d = doigt(canvas(), x0, y0);
      d.bouge(x0, y0 - tc.course * 1.3); let v = 0;
      for (let i = 0; i < 60; i++) { imageSim(PAS); v = Math.max(v, Math.hypot(a.corps.vel.x, a.corps.vel.z)); }
      res.push(['sprint tactique : ≥ 7,6 m/s', v >= 7.6, r3(v) + ' m/s']);
      const P = centre(tc, 'accr'), g = doigt(tc.el.accr, P.x, P.y); g.bouge(P.x, P.y + 30);
      let gl = 0; for (let i = 0; i < 30; i++) { imageSim(PAS); gl = Math.max(gl, a.glisse || 0); }
      g.leve(); d.leve();
      res.push(['glissade', gl > 0.5, 'glisse ' + r3(gl)]);
    } finally { rendreD(); tc._desverrouillerSprint(); jeu.quitter('balade'); }
    return rendre(res);
  }, { apresFusion: true });
  // L3 à la manette : le sprint VERROUILLÉ par lireCommande (L-B) — un appui, stick vers l'avant : tenu ; stick en arrière, RT : rendu
  T('F2 · L3 verrouille le sprint (lireCommande de L-B), stick en arrière ou RT le rendent', async () => {
    settings.controls.fps.tirAuto = false;
    const p = await essai(), c = p.local.cmd, res = [], F = fausseManette();
    try {
      F.stick('g', 0, -1); F.scruter(); jeu.avancer(PAS);
      F.bouton('L3', true); F.scruter(); jeu.avancer(PAS); F.bouton('L3', false);
      let tenu = true; for (let i = 0; i < 30; i++) { F.scruter(); jeu.avancer(PAS); tenu = tenu && c.sprint; }
      F.stick('g', 0, 0.8); F.scruter(); jeu.avancer(PAS); const rendu = !c.sprint;
      F.stick('g', 0, -1); F.bouton('L3', true); F.scruter(); jeu.avancer(PAS); F.bouton('L3', false); F.scruter(); jeu.avancer(PAS);
      F.bouton('RT', true); F.scruter(); jeu.avancer(PAS); const rt = !c.sprint; F.bouton('RT', false); F.stick('g', 0, 0); F.scruter(); jeu.avancer(PAS);
      res.push(['L3 verrouillé vers l’avant (0,25 s tenu)', tenu]); res.push(['stick en arrière : rendu', rendu]); res.push(['RT : rendu', rt]);
    } finally { F.rendre(); jeu.quitter('balade'); }
    return rendre(res);
  }, { apresFusion: true });
  // la roue dessinée par L-G suit le stick (le secteur choisi en surbrillance dans la même image)
  T('F2 · la roue de L-G suit le stick', async () => {
    const res = [];
    await jeu.lancer('prophunt', { graine: 14, zone: 'e1', acteurs: 4, premierRole: 'prop' });
    const p = game.partie, F = fausseManette();
    try {
      F.bouton('LB', true); F.scruter(); p.pas(PAS);
      const k = 6; F.stick('d', Math.sin(k * Math.PI / 4), -Math.cos(k * Math.PI / 4)); F.scruter(); game.frame(1 / 60);
      const roue = document.querySelector('#hud .roue-provocations, #hud [class*="roue"]');
      const choisis = roue ? [...roue.querySelectorAll('[class*="choix"], [class*="on"], [aria-selected="true"]')] : [];
      res.push(['roue dessinée, un secteur en surbrillance', !!roue && !roue.hidden && choisis.length >= 1 && p.roue.choix === k, `${choisis.length} élément(s), choix ${p.roue.choix}`]);
      F.bouton('LB', false); F.stick('d', 0, 0); F.scruter(); p.pas(PAS);
    } finally { F.rendre(); jeu.quitter('balade'); }
    return rendre(res);
  }, { apresFusion: true });
}
