# Rapport L-G — le HUD (vague 2)

Branche `lot/L-G` (depuis `socle` = `socle-ok` e06258f), arbre `C:/Users/hgami/Downloads/IRIS_lots/L-G`, port 8140 ; 23/10/2026.

## Où j'en suis

**EN COURS.** Le code des quatre modules et du CSS est écrit (premier jet complet), pas encore joué dans le navigateur ;
`js/jeu/tests/test_hud.js` pas encore écrit. Prochaine étape : jeton du navigateur, page `?test=1&partie=essai`, regarder
le HUD en vrai, puis les tests.

- `js/jeu/hud_jeu.js` — HudJeu (réticule, marqueurs, « +100 », plaque, score et chrono, domination, fil, vie, munitions,
  arcs, chevrons, grenade proche, annonces, présentation et décompte, carte de mort et désaturation, vignette, lunette,
  stand, `#voile-flash`).
- `js/jeu/hud_prop.js` — HudProp (forme, changements, verrou / figé, anneau de provocation, discrétion, œil, aide
  « E : devenir … », scanner, « VRAI MEUBLE », voir les sons, étiquettes, révélation), RoueProvocations, `#voile-cachette`.
- `js/jeu/tableau_scores.js` — TableauScores (combat : deux colonnes d'équipe ; prop hunt : ses colonnes).
- `js/jeu/minicarte.js` — MiniCarte (silhouette par niveau, nœuds ou repli « pièces + murs », tournante, alliés, pings,
  autres niveaux, anneaux, nom de la pièce ; `dessinerZone` pour le panneau de cachette).
- `css/jeu/hud.css` — tout le style (règles `body.combat` et `#calque-clic` du socle gardées).
