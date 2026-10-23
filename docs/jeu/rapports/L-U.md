# Rapport L-U — menus et options (vague 2)

Branche `lot/L-U` (depuis `socle`, e06258f), arbre `C:/Users/hgami/Downloads/IRIS_lots/L-U`, port 8141 ; 23/10/2026.
Section de la spécification : § 5.5.11 (contrats § 4.5.16, valeurs § 3, propriétaires § 5.2).

## Où j'en suis

**EN COURS** — arbre créé, spécification lue (§§ 0-4, 5.1, 5.5.11 mot pour mot, 6), rapport du socle lu, fichiers du
socle à remplir lus (`menus_jeu.js`, `portraits.js`, `menus.css`, `ui.js`, `index.js`, `manette_menus.js`, `settings.js`,
`harnais.js`). Rien de construit encore.

Prochaines étapes, dans l'ordre :
1. `js/jeu/menus_jeu.js` : accueil, réglages COMBAT / PROP HUNT / STAND, préparation, fin, crédits, caméra à trois plans.
2. `css/jeu/menus.css`.
3. `js/ui.js` : onglet COMBAT, sous-onglets de Commandes, `listen()` souris et molette, bloc manette par profil, Ctrl.
4. `tools/portraits/` et les 7 `assets/portraits/*.webp` (navigateur, jeton).
5. `js/jeu/tests/test_menus.js` (14 critères), puis `&lot=L-U` et `&lot=S0` dans le navigateur (jeton).
