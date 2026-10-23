# Rapport L-B — mouvement et caméras (vague 2)

Branche `lot/L-B` (arbre `C:/Users/hgami/Downloads/IRIS_lots/L-B`), partie de `socle` (`e06258f`, tag `socle-ok`), port 8132 ;
23/10/2026. Spec : `docs/jeu/spec_finale.md` § 5.5.2 (lot L-B), contrats § 4.5.7, valeurs §§ 3.1-3.2.

## Où j'en suis

**EN COURS — étape 6 : le code des quatre modules et les tests des 19 critères sont écrits et commités ; il reste à les
jouer au navigateur (jeton) : `&rapport=1&lot=L-B`, `&lot=S0`, la passe de mesure du franchissement (critère 7 :
`await __jeu.mesuresFranchir()` puis les coordonnées recopiées dans `OBSTACLES` / `RANGS_SERRES` du test).**

Pour un repreneur : serveur `python serve.py 8132` dans l'arbre, prendre un jeton (`mkdir …/_navigateur/jeton_N`), ouvrir
`http://127.0.0.1:8132/?test=1`, puis dans la console `await __jeu.chargerTests('L-B'); await __jeu.tests('L-B', '7')` (le
2e argument filtre les tests dont le nom commence par lui).

Plan (une étape = un commit testé) :
1. `mouvement.js` : allures, sprint tactique, endurance des chasseurs, glissade, saut borné en vol, réception,
   franchissement, accroupi, œil lissé (escaliers, bordures), pas, contacts. — écrit
2. `entrees_jeu.js` : bascules, double Maj / SOURIS 5, verrou de sprint (manette, doigt), souffle du TP-50, recul. — écrit
3. `vue_fps.js` : pose directe, balancement, roulis, champ, visée à focale constante, recul visuel, caméra de mort,
   impulsion, secousse, plafond. — écrit
4. `camera_orbite.js` : chiffres du prop, collisions, plafond, `damp(14)`. — écrit
5. `tests/test_mouvement.js` : les 19 critères (+ 4 tests « À F2 » en `apresFusion`). — écrit
6. Navigateur (jeton) : `&rapport=1&lot=L-B`, `&lot=S0`, jeu à la main, photos. — à faire

## Fait

- `python -I tools/verifier_proprietaires.py lot/L-B` → `OK 6 fichiers (lot/L-B, L-B, base socle)`.

## Écarts au document

## Demandes

## Doutes

## Reste
