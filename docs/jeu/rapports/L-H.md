# Rapport L-H — les effets et les sons (vague 2)

Branche `lot/L-H` (depuis `socle` = `socle-ok` e06258f), arbre `C:/Users/hgami/Downloads/IRIS_lots/L-H`, port 8142 ; 23/10/2026.

## Où j'en suis

**EN COURS.** Tout le code du lot est ÉCRIT et commité, PAS ENCORE JOUÉ dans le navigateur (les trois jetons étaient pris
par d'autres lots ; un script les guette toutes les 30 s) :
- `js/audio.js` (auditeur orienté, bruits précalculés, sortie spatialisée, buzzer / sifflet / refus de LA CAGE) ;
- `js/fx.js` (`budgetImage` et « Priorité fluidité » ; relevé des découpes de l'occlusion quand les pools entrent) ;
- `js/jeu/sons_jeu.js` (SonsJeu complet), `js/jeu/effets.js` (Effets complet), `js/jeu/tests/test_effets.js` (14 + 3).
- `python -I tools/verifier_proprietaires.py lot/L-H` → OK.

Prochaine étape, dès qu'un jeton est pris : `python serve.py 8142` dans l'arbre, `http://127.0.0.1:8142/?test=1&rapport=1&lot=L-H`,
corriger jusqu'au vert, jouer pour de vrai (essai, équipes, stand, domination fabriquée), `&lot=S0`, puis `?tel=1` ; et la
mesure des sons de la balade sur `a8b22dd` (archive dans le dossier de session, servie sur 8142 à `localhost`, script
`compter_a8b22dd.js` = `compterSonsBalade` du test) pour poser `PAS_A8B22DD` dans `test_effets.js`.

Un repreneur : `git log` de `lot/L-H`, puis ce rapport (sections « Ce qui est construit », « Ce qui reste »).

## Ce qui est construit

(à compléter après les essais)

## Écarts au document

(au fil de l'eau)

## Demandes

(au fil de l'eau)

## Ce qui reste

- jouer et tester (voir « Où j'en suis ») ; S0 sur la branche ; `?tel=1` ; rapport final.
