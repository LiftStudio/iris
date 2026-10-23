# Rapport L-F — les règles du prop hunt et ses sons (vague 2)

Branche `lot/L-F` (arbre `C:/Users/hgami/Downloads/IRIS_lots/L-F`), partie de `socle` (`e06258f`, tag `socle-ok`), port 8139 ;
23/10/2026. Fichiers du lot : `js/jeu/partie_prop.js`, `js/jeu/sons_prop.js`, `js/jeu/tests/test_prop.js`, ce rapport.

## Où j'en suis

- [x] Arbre créé, spécification lue (§§ 0-4 en entier, § 5.5.9 mot pour mot, § 5.1-5.2, § 6-8), rapport S0 lu, squelettes
      lus (`partie_prop.js`, `sons_prop.js`, `partie.js`, `acteur.js`, `deguisements.js`, `corps_prop.js`,
      `cerveau_prop.js`, `cerveau.js`, `sons_jeu.js`, `hud_prop.js`, `monde_partie.js`, `harnais.js`, `test_socle.js`).
- [ ] `partie_prop.js` : manches, rôles, composition, phases, pénalités et soins, tirs, provocations, scanner, points, état.
- [ ] `sons_prop.js` : les 8 provocations synthétisées et les petits bruits des props.
- [ ] `test_prop.js` : les 16 critères du § 5.5.9 (+ ceux « à F2 »).
- [ ] Jeu en vrai dans le navigateur intégré (jeton), `&rapport=1&lot=L-F`, `&lot=S0`, `verifier_proprietaires`.

Un repreneur : `cd C:/Users/hgami/Downloads/IRIS_lots/L-F`, `git log --oneline socle..`, puis la case non cochée ci-dessus.
