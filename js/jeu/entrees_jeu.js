// =====================================================================
//  LA LECTURE DES ENTRÉES EN PARTIE — lot L-B (23/10), sur le squelette du socle S0 (22/10)
// =====================================================================
// Le SEUL lecteur d'Input du jeu (spec §§ 4.5.7, 4.8 ; hors `PartieProp.lireExtra`, la roue des provocations, et
// `Partie.image`, le tableau tenu) : il remplit la commande de Haythem à l'étape 2 de `Partie.pas`, où les FRONTS sont
// consommés (un pas les lit une fois ; une image sans pas les garde, js/input.js endFrame les vieillit). Tenus par down(),
// fronts par pressed(), l'axe et son amplitude. Ce qu'il y met en plus du squelette :
//   - les BASCULES (`controls.fps`) : la visée maintenue (défaut) ou basculée, l'accroupi basculé (défaut : `accroupiMaintenu`
//     faux, comme Call of Duty au clavier) ou maintenu ; le sprint ôte l'accroupi basculé et la visée basculée (sauf lunette à
//     l'œil : Maj y retient le souffle), le saut
//     relève d'un accroupi basculé (sauf en glissade : on saute de la glissade) ;
//   - le SPRINT : tenu au clavier (Maj) ; VERROUILLÉ à la manette (L3, comme Call of Duty : un appui, et il dure tant qu'on
//     pousse vers l'avant), sur la 2e touche `sprintTact` (SOURIS 5 : un appui = sprint tactique, puis sprint) et au doigt (le
//     joystick poussé au-delà de son bord, js/touch.js `touchSprint`, = sprint tactique s'il est prêt) ; `sprintAuto` ;
//     le sprint n'est demandé que vers l'avant, ni en visée ni en tirant (la visée l'emporte sur le sprint) ;
//   - le SPRINT TACTIQUE : double appui sur Maj (ou L3) en moins de 0,30 s, ou SOURIS 5 ; jamais pour un acteur
//     `sprintLimite` (les chasseurs du prop hunt) ;
//   - le RECUL DE VISÉE pris à l'arsenal (`prendreRecul`) et appliqué à game.camPitch / camYaw AVANT la copie du regard
//     (un cabré fait monter la visée : camPitch BAISSE), le tangage gardé dans ses bornes ;
//   - le BALANCEMENT DE LA LUNETTE du TP-50 (en huit, 0,25° à 0,5 Hz, à partir de 85 % de la visée) et le SOUFFLE RETENU
//     (Maj en visée : × 0,1 pendant 4 s, puis × 1,5 pendant 2 s) : ajoutés au regard de la COMMANDE — les balles partent où
//     la lunette montre (VueFPS pose le même décalage, `etatEntrees(partie)`) —, jamais à game.camYaw ;
//   - puis l'aide à la visée (manette et doigt seulement, L-I), qui réécrit game.camYaw / camPitch ET la commande.
// Le temps est celui de la partie (`partie.t`) : la commande ne dépend pas de la cadence des images.
import { corriger } from './assistance_visee.js';
import { PAS, TANGAGE_MAX } from './constantes.js';
import { entree } from '../settings.js';

export const ENTREES = {
  doubleSprint: 0.30,                 // s : le double appui du sprint tactique
  sprintAuto: 0.9,                    // la poussée vers l'avant qui lance le sprint automatique
  verrouAmp: 0.3,                     // sous cette poussée, le sprint verrouillé (manette, SOURIS 5) se défait
  lunette: { arme: 'tp50', seuil: 0.85, ampDeg: 0.25, freq: 0.5, lisse: 0.15 },
  souffle: { duree: 4, penalite: 2, retenu: 0.1, essouffle: 1.5 },
};
const DEG = Math.PI / 180;
const _r = { v: 0, h: 0 };
// l'état de la lecture, par partie (les bascules, le verrou du sprint, le souffle, le balancement de la lunette)
const _etats = new WeakMap();
export function etatEntrees(partie) {
  let E = partie ? _etats.get(partie) : null;
  if (!E) {
    E = { visee: false, accroupi: false, sprintAppui: -Infinity, verrou: false, doigtSprint: false, profil: null,
      souffle: { tenu: false, debut: -Infinity, finPenalite: -Infinity, relache: true }, mult: 1, balL: 0, balT: 0, lunette: 0 };
    if (partie) _etats.set(partie, E);
  }
  return E;
}
// un front de l'action venu de la manette (avant de le consommer)
const parManette = (inp, id) => { const cs = inp.bind && inp.bind[id]; if (!cs) return false; for (const c of cs) if (c && c.startsWith('Pad:') && inp.pressedSet.has(c)) return true; return false; };

export function lireCommande(input, game, cmd, profil, partie) {
  const a = partie && partie.local, inp = input;
  const t = partie ? partie.t : 0, E = etatEntrees(partie);
  const s = game.settings, F = (s && s.controls && s.controls.fps) || {};
  // (un changement de rôle, une mort : les bascules repartent de zéro)
  if (E.profil !== profil || (a && !a.vivant)) { E.visee = false; E.accroupi = false; E.verrou = false; E.souffle.tenu = false; E.profil = profil; }
  const ax = inp.axis();
  cmd.ax = ax.x || 0; cmd.ay = ax.y || 0; cmd.amp = (ax.x || ax.y) ? inp.amplitude() : 0;
  const amp = cmd.amp, na = Math.hypot(cmd.ax, cmd.ay), avant = na > 0.02 && cmd.ay / na > 0.5;
  cmd.saut = inp.pressed('jump');
  if (profil === 'prop') {
    cmd.sprint = !!inp.sprint();
    cmd.marche = !cmd.sprint && (inp.down('walk') || (amp > 0.02 && amp < 0.58));
    cmd.accroupi = false; cmd.tir = false; cmd.visee = false; cmd.letale = false; cmd.interagir = false;
    cmd.deguiser = inp.pressed('deguiser');
    cmd.verrou = inp.pressed('verrou');
    cmd.figer = inp.pressed('figer');
  } else {
    // ---- LES BASCULES : la visée, l'accroupi ----
    const viseeMaintenue = F.viseeMaintenue !== false, accMaintenu = !!F.accroupiMaintenu;
    if (inp.pressed('visee') && !viseeMaintenue) E.visee = !E.visee;
    if (inp.pressed('accroupi') && !accMaintenu) E.accroupi = !E.accroupi;
    // ---- LE SPRINT : tenu, verrouillé (manette, SOURIS 5, doigt), automatique ; le double appui → tactique ----
    const manette = parManette(inp, 'sprint');
    const frontSprint = inp.pressed('sprint');
    let tact = inp.pressed('sprintTact');
    if (tact) E.verrou = true;                                          // (SOURIS 5 : un appui, et le sprint dure)
    if (frontSprint) {
      if (t - E.sprintAppui < ENTREES.doubleSprint) tact = true;
      E.sprintAppui = t;
      if (manette || entree.manette) E.verrou = true;                   // (L3 : verrouillé, comme Call of Duty)
    }
    // (au doigt, js/touch.js : AU BORD du joystick, le sprint TENU — `touchSprint`, ni verrou ni tactique ; AU-DELÀ du bord, le
    // verrou, dont le front `sprintTact` passe par la ligne d'au-dessus. F2, demande de L-I : le front de `touchSprint` lançait
    // aussi le tactique, dès le bord — courir à fond au doigt brûlait la jauge à chaque fois)
    const doigt = !!inp.touchSprint;
    const tir = inp.down('tir');
    let visee = viseeMaintenue ? inp.down('visee') : E.visee;
    // (la visée basculée n'est ôtée que par un sprint qui part — vers l'avant — et jamais lunette à l'œil : Maj y retient le
    // souffle ; 23/10, relecture : en visée basculée, Maj sortait de la lunette du TP-50 et le souffle était impossible)
    if (frontSprint || tact) { if (E.accroupi) E.accroupi = false; if (!viseeMaintenue && avant && !(E.lunette > 0)) { E.visee = false; visee = false; } }
    if (E.verrou && (!avant || amp < ENTREES.verrouAmp || visee || tir || (accMaintenu ? inp.down('accroupi') : E.accroupi))) E.verrou = false;
    const auto = !!F.sprintAuto && avant && cmd.ay >= ENTREES.sprintAuto && amp >= ENTREES.sprintAuto;
    const veutSprint = inp.down('sprint') || doigt || E.verrou || auto;
    cmd.sprint = veutSprint && avant && !visee && !tir;
    cmd.sprintTact = !!tact && !(a && a.sprintLimite);
    cmd.marche = !cmd.sprint && (inp.down('walk') || (amp > 0.02 && amp < 0.58));
    // (le saut relève d'un accroupi basculé — sauf en glissade, d'où l'on saute)
    if (cmd.saut && E.accroupi) { E.accroupi = false; if (!(a && a.mvt && a.mvt.glisse)) cmd.saut = false; }
    cmd.accroupi = accMaintenu ? inp.down('accroupi') : E.accroupi;
    cmd.tir = tir;
    cmd.visee = visee;
    cmd.letale = inp.down('letale');
    cmd.interagir = inp.down('interagir');
    cmd.recharger = inp.pressed('recharger');
    cmd.armeSuiv = inp.pressed('armeSuiv');
    cmd.armePrec = inp.pressed('armePrec');
    cmd.armeN = inp.pressed('arme1') ? 1 : inp.pressed('arme2') ? 2 : 0;
    cmd.couteau = inp.pressed('couteau');
    cmd.tactique = inp.pressed('tactique');
    cmd.serie = inp.pressed('serie1') ? 1 : inp.pressed('serie2') ? 2 : inp.pressed('serie3') ? 3 : 0;
    cmd.scanner = inp.pressed('scanner');
  }
  // LE RECUL DE VISÉE (§ 3.4) : consommé ici, au pas qui suit le tir — un cabré fait monter la visée : camPitch BAISSE
  const [lo, hi] = game.bornesTangage ? game.bornesTangage() : [-TANGAGE_MAX, TANGAGE_MAX];
  if (a && a.arsenal) {
    a.arsenal.prendreRecul(_r);
    if (_r.v || _r.h) { game.camPitch = Math.max(lo, Math.min(hi, game.camPitch - _r.v)); game.camYaw -= _r.h; }
  }
  cmd.lacet = game.camYaw; cmd.tangage = game.camPitch;
  cmd.seq++;
  corriger(cmd, game, PAS);
  // LA LUNETTE DU TP-50 : le balancement en huit (et le souffle retenu), dans le regard de la commande
  lunette(a, inp, cmd, t, E, lo, hi, profil);
  return cmd;
}

function lunette(a, inp, cmd, t, E, lo, hi, profil) {
  const L = ENTREES.lunette, S = ENTREES.souffle, B = E.souffle;
  const A = a && a.arsenal, f = A && A.arme;
  const k = profil !== 'prop' && f && f.id === L.arme ? Math.max(0, Math.min(1, (A.visee - L.seuil) / (1 - L.seuil))) : 0;
  E.lunette = k;
  // le souffle : Maj tenu, la lunette à l'œil
  const maj = k > 0 && inp.down('sprint');
  if (!maj) B.relache = true;
  if (maj && B.relache && !B.tenu && t >= B.finPenalite) { B.tenu = true; B.debut = t; B.relache = false; }
  if (B.tenu && (!maj || k <= 0)) B.tenu = false;
  if (B.tenu && t - B.debut >= S.duree) { B.tenu = false; B.finPenalite = t + S.penalite; }
  const cible = B.tenu ? S.retenu : t < B.finPenalite ? S.essouffle : 1;
  E.mult += (cible - E.mult) * (1 - Math.exp(-PAS / L.lisse));
  if (k <= 0) { E.balL = 0; E.balT = 0; return; }
  const w = 2 * Math.PI * L.freq, amp = L.ampDeg * DEG * E.mult * k;
  E.balL = amp * Math.sin(w * t);
  E.balT = amp * 0.5 * Math.sin(2 * w * t);
  cmd.lacet += E.balL;
  cmd.tangage = Math.max(lo, Math.min(hi, cmd.tangage + E.balT));
}
