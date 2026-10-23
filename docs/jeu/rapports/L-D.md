# Rapport L-D — navigation, pilotage, apparitions (vague 2)

Branche `lot/L-D` (arbre `C:/Users/hgami/Downloads/IRIS_lots/L-D`, depuis `socle` = `socle-ok`), port 8136 ; 23/10/2026.

## Où j'en suis

- [ ] `nav.js` : génération (méthode B), deux graphes, CSR, empreinte, cache, A* d'un bloc et en file, champs, couverts
- [ ] `nav_cache.js` : IndexedDB `iris.nav`
- [ ] `pilotage.js` : `Pilote` (ficelle par balayage, évitement, face-à-face, franchir, coincé → secours), `Errant`
- [ ] `apparitions.js` : départs, réapparition (§ 3.8), `ramenerPoint`
- [ ] `tests/test_nav.js` : les 16 critères du § 5.5.6 (+ tests `apresFusion`)
- [ ] joué dans le navigateur (jeton), `&lot=L-D` vert, `&lot=S0` vert, propriétaires OK

Un repreneur : `git log` de `lot/L-D`, puis la première case non cochée.
