// =====================================================================
//  L'AIDE À LA VISÉE — squelette du socle S0 (22/10), rempli par le lot L-I
// =====================================================================
// À la manette et au doigt, JAMAIS à la souris (spec §§ 3.2, 4.5.18) : ralentissement sur le buste d'un ennemi vu, suivi,
// aimant d'ADS, tir auto au téléphone. `corriger` est appelée par lireCommande (js/jeu/entrees_jeu.js) et réécrit
// game.camYaw / camPitch ET cmd.lacet / tangage (sinon la commande suivante, relue sur game, annulerait l'aimant) ;
// `facteurStick` ne fait que multiplier la vitesse du stick (js/manette.js). Le squelette : sans effet.

export function corriger(cmd, game, dt) { return cmd; }
export function facteurStick(game) { return 1; }
