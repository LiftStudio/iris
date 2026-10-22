// =====================================================================
//  LA LECTURE DES ENTRÉES EN PARTIE — squelette du socle S0 (22/10), rempli par le lot L-B
// =====================================================================
// Le SEUL lecteur d'Input du jeu (spec §§ 4.5.7, 4.8 ; hors `PartieProp.lireExtra`, la roue des provocations, et
// `Partie.image`, le tableau tenu) : il remplit la commande de Haythem à l'étape 2 de `Partie.pas`, où les FRONTS sont
// consommés (un pas les lit une fois ; une image sans pas les garde, js/input.js endFrame les vieillit). Tenus par down(),
// fronts par pressed(), l'axe et son amplitude ; le sprint tactique sur un double appui de Maj (< 0,30 s) ou sur la 2e
// touche `sprintTact` (SOURIS 5), jamais pour un acteur `sprintLimite` ; le recul de VISÉE pris à l'arsenal
// (`prendreRecul`) et appliqué à game.camPitch / camYaw AVANT la copie du regard ; puis l'aide à la visée (manette et
// doigt seulement), qui réécrit game.camYaw / camPitch ET la commande. L-B y met les bascules de visée et d'accroupi
// (controls.fps), la molette, les réglages fins.
import { corriger } from './assistance_visee.js';
import { PAS } from './constantes.js';

const _r = { v: 0, h: 0 };

export function lireCommande(input, game, cmd, profil, partie) {
  const a = partie && partie.local, inp = input;
  const t = partie ? partie.t : 0;
  const ax = inp.axis();
  cmd.ax = ax.x || 0; cmd.ay = ax.y || 0; cmd.amp = (ax.x || ax.y) ? inp.amplitude() : 0;
  cmd.sprint = !!inp.sprint();
  const amp = cmd.amp;
  cmd.marche = !cmd.sprint && (inp.down('walk') || (amp > 0.02 && amp < 0.58));
  cmd.saut = inp.pressed('jump');
  if (profil === 'prop') {
    cmd.accroupi = false; cmd.tir = false; cmd.visee = false; cmd.letale = false; cmd.interagir = false;
    cmd.deguiser = inp.pressed('deguiser');
    cmd.verrou = inp.pressed('verrou');
    cmd.figer = inp.pressed('figer');
  } else {
    cmd.accroupi = inp.down('accroupi');
    cmd.tir = inp.down('tir');
    cmd.visee = inp.down('visee');
    cmd.letale = inp.down('letale');
    cmd.interagir = inp.down('interagir');
    // le sprint tactique : double appui sur Maj, ou la 2e touche (un appui)
    const appuiSprint = inp.pressed('sprint');
    let tact = inp.pressed('sprintTact');
    if (appuiSprint) { if (partie && t - (partie._sprintAppui ?? -1) < 0.30) tact = true; if (partie) partie._sprintAppui = t; }
    cmd.sprintTact = !!tact && !(a && a.sprintLimite);
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
  if (a && a.arsenal) {
    a.arsenal.prendreRecul(_r);
    if (_r.v || _r.h) { game.camPitch -= _r.v; game.camYaw -= _r.h; }
  }
  cmd.lacet = game.camYaw; cmd.tangage = game.camPitch;
  cmd.seq++;
  corriger(cmd, game, PAS);
  return cmd;
}
