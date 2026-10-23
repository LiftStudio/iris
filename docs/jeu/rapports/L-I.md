# Rapport L-I — tactile, manette, assistance (vague 2)

Branche `lot/L-I` (arbre `C:/Users/hgami/Downloads/IRIS_lots/L-I`), partie de `socle` (`e06258f`, tag `socle-ok`), port 8143 ;
23/10/2026. Spécification : `docs/jeu/spec_finale.md` §§ 3.2, 4.5.18, 5.5.13 (et §§ 4.8, 6.2, 6.3).

## Où j'en suis

**EN COURS — étape 1 : lecture faite, code pas encore écrit.** Spécification lue (§§ 0-4 en entier, § 5.1, § 5.4, ma
section mot pour mot, § 6), rapport du socle lu, fichiers lus : `js/touch.js`, `js/manette.js`, `js/manette_menus.js`,
`js/jeu/assistance_visee.js`, `css/jeu/tactile.css`, et ce qui s'y branche (`entrees_jeu.js`, `partie.js`,
`partie_prop.js`, `index.js`, `menus_jeu.js`, `harnais.js`, `input.js`, `settings.js`, `game.js`).

Plan : (1) `assistance_visee.js` (cible d'aide, ralentissement, suivi, aimant d'ADS, tir auto) ; (2) `manette.js` en
partie (bornes, 3,6 rad/s, accélération, visée, roue, calque, sprint verrouillé sur L3, vibrations sur événements, aide
du profil) ; (3) `touch.js` en partie (emplacements du jeu, contextes combat / prop / chasseur, TIR mixte, VISER en bascule,
sprint verrouillé, glissade, PROVOQUER long / bref, calque) + `tactile.css` ; (4) `manette_menus.js` ; (5)
`tests/test_mobile.js` (13 critères + ceux de F2) ; (6) jouer au navigateur (jeton), S0 rejoué, propriétaires.
