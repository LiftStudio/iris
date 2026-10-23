# Rapport L-A — armes et balistique (vague 2)

Branche `lot/L-A` (arbre `C:/Users/hgami/Downloads/IRIS_lots/L-A`), partie de `socle` (`e06258f`, tag `socle-ok`),
port 8131 ; 23/10/2026. Fichiers du lot : `js/jeu/armes.js`, `js/jeu/balistique.js`, `js/jeu/touches.js`,
`js/jeu/grenade.js`, `js/jeu/tests/test_armes.js` (et ce rapport).

## Où j'en suis

**EN COURS — code écrit et vérifié HORS navigateur, pas encore joué dans le navigateur** (les trois jetons pris par
L-D, L-G et L-V depuis 03:05-03:20 ; une boucle attend le premier libre). Fait :
- `balistique.js` : le parcours DDA de la grille (plus proche impact, sortie anticipée), les 53 sols (dalles, rampes en
  trois morceaux, plan y = 0 là où `solEn(x, z, 0,1)` le rend), les trois modes (`balle` : vitres traversées et notées ;
  `vue` : vitres claires et `camera: false` ignorées, `depoli` arrête ; `objet` : grenades et souffle), le pré-filtre
  des zones (`zonesCachees` / `zoneDe`) et `EXCEPTIONS_PREFILTRE`, `tirer` (monde puis acteurs, fêlure sur chaque vitre
  traversée, `traverse`), `libre` (ajout), `matiere` ;
- `touches.js` : capsules réutilisées (aucune allocation), tête avancée de 0,04 + 0,02·v selon le cap, boîte du prop
  décentrée, `teteSimulee` (ajout) ;
- `armes.js` : l'arsenal complet (dispersion du § 3.4 et valeurs des quatre autres armes, recul à motif, boucle, aléa,
  rappel, ressort visuel, visée sur la courbe, recharges tactique / à vide / FP-12 cartouche par cartouche interruptible,
  sprint et sa sortie, franchissement, couteau et fente, frag cuite et flash, changement d'arme à mi-geste, `tirage`) ;
- `grenade.js` : vol par le monde solide (mode `objet`), rebonds (restitution 0,35, frottement 0,6), sonde du sol, roulement,
  arrêt, explosion (distance au corps, ligne libre centre + 0,3 → buste ou tête), flash (formule, ligne de vue) ;
- `tests/test_armes.js` : les 18 critères du § 5.5.1, un 19e (le pré-filtre validé) et deux tests `apresFusion`.
- Banc HORS NAVIGATEUR (node, monde synthétique, partie factice ; scratchpad `la/essai1.mjs`, `essai3.mjs`) : cadences
  FA-24 2,3167 s, PM-9 2,0583, FP-12 7,7083, TP-50 1,3250 (± 1 pas) ; recul 6,76° / 0,15°, rappel − 2,704° (40 %) ;
  recharge tactique 1,90 s → 31 ; FP-12 3 cartouches 1,9167 s → 7, interrompu par un tir ; sprint à 1,30 s → annulée ;
  dispersion 2,2 / 4,6 / 8,0 ; couteau et fente ; grenade lancée posée au sol (2 rebonds, 2,3 m de roulement), explosion ;
  frag 160 / 92,5 / 25, 0 derrière un mur ; flash 2,4 s de face, rien derrière un mur ; dalle, rampe (dessus et dessous),
  plan y = 0, vitre traversée, cylindre, boîte orientée, vue claire / dépolie, objet arrêté par la vitre ; état de
  l'arsenal rejoué au bit près (recharge en cours, grenade en main, et la suite).

Reste : jouer dans le navigateur (`&rapport=1&lot=L-A`, puis `&lot=S0` sur la branche), corriger, mesurer, vérifier le
ressenti en jouant (essai à la souris), finir ce rapport.
