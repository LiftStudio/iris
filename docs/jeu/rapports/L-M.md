# Rapport L-M — le monde en partie (vague 2)

Branche `lot/L-M` (arbre `C:/Users/hgami/Downloads/IRIS_lots/L-M`, depuis `socle` = `socle-ok`), port 8144 ; 23/10/2026.

## Où j'en suis

- [x] Lecture : spec §§ 0-4, § 5.5.14 mot pour mot, § 5.1-5.3, § 6 ; rapport S0 ; `carte_monde.md` §§ 1-10.
- [x] Prises de la carte (§ 5.3) : `ecole_portes.js` (noms stables, `liste`, `pilotees`, `forcer`, `instantane` /
  `restaurer`, `vitre: true` des modèles vitrés), `ecole_visibilite.js` (`forcees`), `ecole_ascenseur.js` (coupé en partie,
  `instantane` / `restaurer` / `couper`, l'étiquette de l'extincteur), `carte_ecole.js` (« jour » `balle: false`,
  `visibilite` et `miroirAccueil` au retour).
- [ ] `js/jeu/monde_partie.js` (tables, dépolis, barrières, rubalise, vantaux solides, entrer / sortir, portes du pas).
- [ ] `js/jeu/tests/test_monde.js` (14 critères).
- [ ] Navigateur (jeton) : relevé des portes et des vitres, mise au point, `&lot=L-M`, `&lot=S0`, photos.
- [ ] `verifier_proprietaires.py`, rapport final.

Un repreneur : `git log` de `lot/L-M`, puis la case suivante.
