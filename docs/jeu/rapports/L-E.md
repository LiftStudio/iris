# Rapport L-E — règles du combat et stand de tir (vague 2)

Branche `lot/L-E` (arbre `C:/Users/hgami/Downloads/IRIS_lots/L-E`), partie de `socle` (`e06258f`, tag `socle-ok`), port 8137 ;
23/10/2026. Fichiers : `js/jeu/partie_fps.js`, `js/jeu/partie_stand.js`, `js/jeu/tests/test_combat.js` (spec §§ 2.3-2.6, 3.5,
3.8, 4.5.12, 5.5.7).

## Où j'en suis

**EN COURS — étape 0** : arbre créé, spécification lue (§§ 0-4, 5.1, 5.2, 5.5.7 mot pour mot), rapport S0 lu, squelettes
lus (`partie.js`, `partie_fps.js`, `partie_stand.js`, `acteur.js`, `armes.js`, `apparitions.js`, `cerveau.js`, `touches.js`,
`balistique.js`, `monde_partie.js`, `index.js`, `harnais.js`). Prochaine étape : la passe de mesure du stand (navigateur,
jeton), puis `partie_fps.js`.

Plan :
1. mesure de la rue (lignes de tir libres de vélos, jardinières, voitures) → table `STAND` ;
2. `PartieFPS` : phases, dotations, régénération, protection, réapparitions, barème, assistances, suicides, munitions,
   limites PC / téléphone, `hud` ; domination (anneaux ramenés, captures, points, mi-temps) ; état sérialisable ;
3. `PartieStand` : ligne de tir, cibles qui se lèvent, quatre défis, mannequin, records ;
4. `test_combat.js` : les 16 critères du § 5.5.7 (+ ceux laissés à F2 en `apresFusion`) ;
5. jeu à la main dans le navigateur, `&rapport=1&lot=L-E`, `&lot=S0`, vérificateur des propriétaires.
